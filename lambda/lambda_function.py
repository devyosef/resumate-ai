import json
import boto3
import os
import time
import openai
from weasyprint import HTML

textract_region = os.getenv('AWS_TEXTRACT_REGION')
openai.api_key = os.getenv('OPENAI_API')
openai_model = os.getenv('OPENAI_MODEL')
apigw_domain = os.getenv('AWS_APIGW_DOMAIN')
apigw_stage = os.getenv('AWS_APIGW_STAGE')
s3_bucket = os.getenv('AWS_S3_BUCKET')
sns_topic_arn = os.getenv('AWS_SNS_TOPIC_ARN')
sns_role_arn = os.getenv('AWS_SNS_ROLE_ARN')

s3_client = boto3.client('s3')
textract = boto3.client('textract', region_name=textract_region)
lambda_client = boto3.client('lambda')


def notify_client(connection_id, message):
    api_gateway = boto3.client('apigatewaymanagementapi', endpoint_url=f'https://{apigw_domain}/{apigw_stage}')
    try:
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(message)
        )
    except Exception as e:
        print(f"Error sending WebSocket message: {str(e)}")

def get_textract_results(job_id):
    while True:
        response = textract.get_document_text_detection(JobId=job_id)
        status = response['JobStatus']
        
        if status == 'SUCCEEDED':
            text_blocks = []
            for block in response['Blocks']:
                if block['BlockType'] == 'LINE':
                    text_blocks.append(block['Text'])
            return ' '.join(text_blocks)
            
        elif status == 'FAILED':
            raise Exception("Textract processing failed")
        
        time.sleep(1)

def process_with_ai(extracted_text, job_description, connection_id):
    prompt = f"""
    As a resume review expert, you will receive a resume and job description offer. You will analyze the content on the resume and see how much it matches the job description in percentage. If you find any improvements to be made in the keywords or phrasing in the resume experience content, you will adjust it to make it as close as possible to the job offer requirements, including skills and responsibilities. However, do not change the context of what was mentioned or add new keywords or skills that are not on the original resume.

    The output must be in valid JSON format that contains:
    - percentage_of_matching_before: the percentage of matching between the resume and the job description before making any changes.
    - percentage_of_matching_after: the percentage of matching between the resume and the job description after making the changes.
    - new_resume: the enhanced resume that contains all elements from the original resume, along with the new changes applied.

    Resume:
    {extracted_text}

    Job Description:
    {job_description}
    """

    openai_response = openai.ChatCompletion.create(
        model=openai_model,
        messages=[{
            "role": "user",
            "content": prompt,
        }],
    )

    response_text = openai_response['choices'][0]['message']['content'].strip().strip('`').replace('json', '')
    try:
        json_response = json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {str(e)}")
        notify_client(connection_id, {'status': 'error', 'message': 'AI response is not valid JSON'})
        return
    print(json_response)
    
    notify_client(connection_id, {
        'status': 'processing',
        'message': 'Generating new resume'
    })

    url = process_template_and_generate_pdf("new_resume.pdf", json_response['new_resume'])
    return {
        "percentage_before" : json_response['percentage_of_matching_before'],
        "percentage_after": json_response['percentage_of_matching_after'],
        "presigned_url": url
    }

def lambda_handler(event, context):
    try:
        if 'jobId' in event:
            job_id = event['jobId']
            connection_id = event['connectionId']
            domain_name = event['domainName']
            stage = event['stage']
            job_description = event['jobDescription']

            extracted_text = get_textract_results(job_id)

            notify_client(connection_id, {
                'status': 'processing',
                'message': 'Analyzing with AI'
            })

            ai_response = process_with_ai(extracted_text, job_description, connection_id)

            notify_client(connection_id, {
                'status': 'complete',
                'data': ai_response
            })

            return {'statusCode': 200}

        connection_id = event['requestContext']['connectionId']
        domain_name = apigw_domain
        stage = apigw_stage
        
        body = json.loads(event['body'])
        data = body.get('data')
        
        if isinstance(data, str):
            data = json.loads(data)

        job_description = data.get('jobDescription')
        file_key = data.get('fileKey')

        if not job_description or not file_key:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': "Both 'jobDescription' and 'fileKey' are required"})
            }

        textract_response = textract.start_document_text_detection(
            DocumentLocation={
                'S3Object': {
                    'Bucket': s3_bucket,
                    'Name': file_key
                }
            },
            NotificationChannel={
                'SNSTopicArn': sns_topic_arn,
                'RoleArn': sns_role_arn
            }
        )
        
        job_id = textract_response['JobId']

        notify_client(connection_id, {
            'status': 'processing',
            'message': 'Processing started',
            'jobId': job_id
        })

        lambda_client.invoke(
            FunctionName=context.function_name,
            InvocationType='Event',
            Payload=json.dumps({
                'jobId': job_id,
                'connectionId': connection_id,
                'domainName': domain_name,
                'stage': stage,
                'jobDescription': job_description
            })
        )

        return {'statusCode': 200}

    except Exception as e:
        if 'connection_id' in locals():
            notify_client(connection_id, {
                'status': 'error',
                'message': str(e)
            })
        return {'statusCode': 200}

def process_template_and_generate_pdf(output_key, generated_resume):
    try:
        template_response = s3_client.get_object(Bucket=s3_bucket, Key='templates/resume_template.html')
        template_html = template_response['Body'].read().decode('utf-8')

        prompt = f"""
        Take the new_resume data in a JSON object and use it to create a resume based on the HTML file I uploaded earlier.
        The HTML template is just an example of the resume structure to follow in order to place the elements from new_resume.
        The goal is to generate a new resume using the information from the JSON attributes and insert it into the HTML template.
        You can create new sections if they don't exist in the template, and remove elements that are not in new_resume.
        The purpose of the template is to serve as a design guide; the predefined elements in it do not need to be present in the 
        final resume.

        Template HTML:
        {template_html}

        The new resume:
        {generated_resume}

        Return the modified HTML code directly as valid HTML.
        """

        openai_response = openai.ChatCompletion.create(
            model=openai_model,
            messages=[{
                "role": "user",
                "content": prompt,
            }],
        )
        new_html_content = openai_response['choices'][0]['message']['content'].strip('`').replace('```html', '')
        local_pdf_file_path = '/tmp/generated_resume_analysis.pdf'
        HTML(string=new_html_content).write_pdf(local_pdf_file_path)

        s3_client.upload_file(local_pdf_file_path, s3_bucket, output_key)

        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': s3_bucket, 'Key': output_key},
            ExpiresIn=3600
        )
        return presigned_url
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }
    finally:
        if os.path.exists(local_pdf_file_path):
            os.remove(local_pdf_file_path)
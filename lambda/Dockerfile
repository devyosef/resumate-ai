FROM public.ecr.aws/lambda/python:3.10-x86_64

RUN yum -y update && \
    yum -y groupinstall "Development Tools" && \
    yum -y install \
       gcc \
       libffi-devel \
       cairo-devel \
       gdk-pixbuf2-devel \
       harfbuzz-devel \
       freetype-devel \
       fontconfig-devel \
       python3-devel \
       glib2-devel \
       glibc-devel \
       wget \
       pango \
       python3-pip && \
    yum clean all

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY lambda_function.py /var/task/lambda_function.py
CMD ["lambda_function.lambda_handler"] 
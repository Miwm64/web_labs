FROM httpd:2.4-alpine

COPY httpd.conf /usr/local/apache2/conf/httpd.conf
COPY frontend/ /usr/local/apache2/htdocs/

USER www-data

EXPOSE 8080

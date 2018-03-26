FROM php:5.6.33-apache
COPY ./apache2.conf /etc/apache2/apache2.conf
COPY ./php-timezone.ini /usr/local/etc/php/conf.d/timezone.ini
COPY ./http /var/www/html

RUN docker-php-ext-install mysqli

RUN apt-get update && apt-get install -y \
    libmagickwand-dev --no-install-recommends \
    && pecl install imagick \
    && docker-php-ext-enable imagick


RUN curl -fsS -o /tmp/icu.tgz -L http://download.icu-project.org/files/icu4c/59.1/icu4c-59_1-src.tgz \
    && tar -zxf /tmp/icu.tgz -C /tmp \
    && cd /tmp/icu/source \
    && ./configure --prefix=/usr/local \
    && make \
    && make install \
  # just to be certain things are cleaned up
    && rm -rf /tmp/icu*

# PHP_CPPFLAGS are used by the docker-php-ext-* scripts
ENV PHP_CPPFLAGS="$PHP_CPPFLAGS -std=c++11"

RUN docker-php-ext-configure intl --with-icu-dir=/usr/local \
# run configure and install in the same RUN line, they extract and clean up the php source to save space
  && docker-php-ext-install intl

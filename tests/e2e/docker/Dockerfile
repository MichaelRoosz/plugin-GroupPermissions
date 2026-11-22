# Matomo image for the end-to-end tests. There is no official Docker image for Matomo 6 yet: this takes the
# latest official Matomo 5 image (Apache, PHP 8.x, entrypoint that copies /usr/src/matomo into the web root) and
# replaces its Matomo with the release build of MATOMO_VERSION from builds.matomo.org.
ARG BASE_IMAGE=matomo:5-apache

FROM alpine:3 AS download
ARG MATOMO_VERSION
RUN apk add --no-cache curl unzip \
    && curl -fsSL -o /tmp/matomo.zip "https://builds.matomo.org/matomo-${MATOMO_VERSION}.zip" \
    && unzip -q /tmp/matomo.zip -d /tmp/build \
    && test -f /tmp/build/matomo/matomo.php

FROM ${BASE_IMAGE}
RUN rm -rf /usr/src/matomo
COPY --from=download --chown=www-data:www-data /tmp/build/matomo /usr/src/matomo

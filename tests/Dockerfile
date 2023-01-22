# syntax=docker/dockerfile:1

FROM alpine:3.17.1

WORKDIR /app

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]

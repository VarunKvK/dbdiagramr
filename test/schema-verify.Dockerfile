FROM postgres:16-alpine

RUN apk add --no-cache --virtual .build-deps build-base git postgresql16-dev \
 && git clone --branch v0.8.1 --depth 1 https://github.com/pgvector/pgvector.git /tmp/pgvector \
 && make -C /tmp/pgvector install with_llvm=no \
 && rm -rf /tmp/pgvector \
 && apk del .build-deps

FROM node:22-alpine
WORKDIR /app
COPY server.js .
ENV PORT=8787 DATA=/data
VOLUME /data
EXPOSE 8787
CMD ["node","server.js"]

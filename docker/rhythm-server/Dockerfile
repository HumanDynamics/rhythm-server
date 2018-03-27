FROM node:8
LABEL Description="This image is used to for developing the rhythm-server"

ENV AUTH_ID_FIELD="id"
ENV AUTH_ON="true"
ENV AUTH_TOKEN_EXPIRESIN="1000d"
ENV AUTH_TOKEN_SECRET="my-secret"
ENV CRYPTO_KEY="'your-key-here'"
ENV DEFAULT_USER_EMAIL="default-user-email"
ENV DEFAULT_USER_PASSWORD="default-user-password"
ENV MONGODB_URI="mongodb://rhythm-mongo-server/rhythm-test"
ENV MONGO_CERT="some-fake-cert"
ENV NODE_ENV="default"
ENV PORT="3000"
ENV REPORT_EMAIL_FROM="'MM Reports' <email@address.com>"
ENV REPORT_EMAIL_HOST="smtp server here"
ENV REPORT_EMAIL_LOGIN="email@address.com"
ENV REPORT_EMAIL_PASSWORD="emailpassword"
ENV REPORT_EMAIL_SUBJECT="Your Group Discussion Report"
ENV REPORT_EMAIL_TEXT="See attached for a visual report of your recent group discussion!"
ENV SEND_REPORT="false"
ENV END_MEETING_AFTER_MINUTES=2

EXPOSE 3000

# rhythm-server repository working directory must be bound at /app and all dependent packages installed
VOLUME /app
WORKDIR /app
CMD ["npm", "start"]
# ENTRYPOINT ["/bin/bash"]


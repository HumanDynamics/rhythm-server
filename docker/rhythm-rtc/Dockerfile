FROM node:8
LABEL Description="This image is used to for developing the rhythm-rtc"

ENV REACT_APP_SERVER_TOKEN=my-secret
ENV REACT_APP_SERVER_URL=localhost:3000
ENV REACT_APP_SERVER_EMAIL=default-user-email
ENV REACT_APP_SERVER_PASSWORD=default-user-password
ENV REACT_APP_TRACK_FACE=false
ENV REACT_APP_SIGNALMASTER_URL=sigalmaster.url
ENV PORT=3001
ENV CONSUMER_KEY=key
ENV CONSUMER_SECRET=secret
ENV SESSION_SECRET=secret
ENV REACT_APP_DEBUG=true
ENV CI=false

EXPOSE 3001

# rhythm-rtc repository working directory must be bound at /app and all dependent packages installed
VOLUME /app
WORKDIR /app
CMD ["npm", "start"]
# ENTRYPOINT ["/bin/bash"]


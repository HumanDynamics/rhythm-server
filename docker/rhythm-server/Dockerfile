FROM node:8
LABEL Description="This image runs the rhythm-server which collects utterance info made by participants in meetings"

EXPOSE 3000

# rhythm-server repository working directory must be bound at /app and all dependent packages installed
VOLUME /app
WORKDIR /app
CMD ["npm", "start"]
# ENTRYPOINT ["/bin/bash"]


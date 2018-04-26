FROM node:8
LABEL Description="This image runs the rhythm-server which collects utterance info made by participants in meetings"

# Modified bashrc which defines some aliases and an interactive prompt (for both root & node users)
COPY bashrc /root/.bashrc

# node images have a node user w/ UID 1000 (works well for me for now, but more thought may be needed later) -mjl
USER node
COPY bashrc /home/node/.bashrc

EXPOSE 3000

# rhythm-server repository working directory must be bound at /app and all dependent packages installed
VOLUME /app
WORKDIR /app
CMD ["npm", "start"]
# ENTRYPOINT ["/bin/bash"]


FROM node:8
LABEL Description="This image runs rhythm-rtc which serves the pages to enable video chat w/ the Media Manager"

# Modified bashrc which defines some aliases
COPY bashrc /root/.bashrc

EXPOSE 3001

# rhythm-rtc repository working directory must be bound at /app and all dependent packages installed
VOLUME /app
WORKDIR /app
CMD ["npm", "start"]
# ENTRYPOINT ["/bin/bash"]


FROM node:11

RUN echo $HOME
RUN mkdir $HOME/iot-door-sensor-svr
WORKDIR $HOME/iot-door-sensor-svr
RUN git https://github.com/kenken64/iot-door-sensor.git
RUN npm install

CMD [ "npm", "start" ]
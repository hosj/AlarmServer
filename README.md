# AlarmServer
Raspberry Pi Alarm Monitor thing


Basically this is a two part thing. 

AlarmServer.py monitors sensors and emails/texts/push notifications you if one is tripped. 
It also listens on a poirt for commands to arm, disarm, test buzeer, or open/close garage door etc

There is also a node app to show status, add sensors, users etc.

There are also some helper scripts to auto arm at a certain time, arm if no registered cell phones are pingable, 

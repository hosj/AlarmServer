#        #### ##     ## ########   #######  ########  ########  ######
#         ##  ###   ### ##     ## ##     ## ##     ##    ##    ##    ##
#         ##  #### #### ##     ## ##     ## ##     ##    ##    ##
#         ##  ## ### ## ########  ##     ## ########     ##     ######
#         ##  ##     ## ##        ##     ## ##   ##      ##          ##
#         ##  ##     ## ##        ##     ## ##    ##     ##    ##    ##
#        #### ##     ## ##         #######  ##     ##    ##     ######
import os, time, sys, datetime
import json
import threading, queue
import subprocess
# if running on the pi import the real GPIO other wise use our fake one
try:
	import RPi.GPIO as io
except:
	import fakeGPIO as io
import pymysql

# Sending emails
import smtplib
from email.mime.text import MIMEText

#        ##     ##    ###    ########  ####    ###    ########  ##       ########  ######
#        ##     ##   ## ##   ##     ##  ##    ## ##   ##     ## ##       ##       ##    ##
#        ##     ##  ##   ##  ##     ##  ##   ##   ##  ##     ## ##       ##       ##
#        ##     ## ##     ## ########   ##  ##     ## ########  ##       ######    ######
#         ##   ##  ######### ##   ##    ##  ######### ##     ## ##       ##             ##
#          ## ##   ##     ## ##    ##   ##  ##     ## ##     ## ##       ##       ##    ##
#           ###    ##     ## ##     ## #### ##     ## ########  ######## ########  ######

# DB vars
conn = ''
cur = ''

# Store sensors in list
sensors = []

# Store users in list
users = []

# house settings
settings = {}

# script settings
script_settings = {}

# Alarm Thread
alarm_thread = None

# Proximity Thread
proximity_thread = None

# Time Thread
time_thread = None

#           ###    ##          ###    ########  ##     ##    ##     ##  #######  ##    ## #### ########  #######  ########
#          ## ##   ##         ## ##   ##     ## ###   ###    ###   ### ##     ## ###   ##  ##     ##    ##     ## ##     ##
#         ##   ##  ##        ##   ##  ##     ## #### ####    #### #### ##     ## ####  ##  ##     ##    ##     ## ##     ##
#        ##     ## ##       ##     ## ########  ## ### ##    ## ### ## ##     ## ## ## ##  ##     ##    ##     ## ########
#        ######### ##       ######### ##   ##   ##     ##    ##     ## ##     ## ##  ####  ##     ##    ##     ## ##   ##
#        ##     ## ##       ##     ## ##    ##  ##     ##    ##     ## ##     ## ##   ###  ##     ##    ##     ## ##    ##
#        ##     ## ######## ##     ## ##     ## ##     ##    ##     ##  #######  ##    ## ####    ##     #######  ##     ##
class AlarmMonitor(threading.Thread):

	def __init__(self, command_q, result_q):
		super(AlarmMonitor, self).__init__()
		self.command_q = command_q
		self.result_q = result_q
		self.stoprequest = threading.Event()
		# open db
		db_open()

		# Load our sensors
		load_sensors()

		# Load our settings
		load_settings()

		# close db
		db_close()

		# setup system
		setup_system()
	def buzz(self,pin):
		# buzz the buzzer
		if settings['buzzer']:
			io.output(buzzer_pin, True)
			time.sleep(.5)
			io.output(buzzer_pin, False)
			pass
		else:
			print('BUZZZZZZZZZZZZZZZZ')

	def run(self):
		global sensors
		while not self.stoprequest.isSet():
			# Check if we were asked to do anything
			try:
				com = str(self.command_q.get(True, 0.05)).split('|')
				command = com[0].upper()
				try:
					arg = com[1]
				except:
					arg = ''


				if command == '':
					pass
				elif command == 'RELOAD':

					db_open()

					log('The server was reloaded')
					# Load our sensors
					load_sensors()

					# Load our settings
					load_settings()

					# close db
					db_close()

					# setup system
					setup_system()
				elif command == 'TESTBUZZER':
					pass
				elif command == 'ARM':
					db_open()
					cur.execute('UPDATE houses SET armed=1')
					conn.commit()
					load_settings()
					log('The System has been armed')
					db_close()
				elif command == 'DISARM':
					db_open()
					cur.execute('UPDATE houses SET armed=0')
					conn.commit()
					load_settings()
					log('The System has been disarmed')
					db_close()
				elif command == 'OPEN':
					db_open()
					log('Something has been Opened')
					db_close()
					pass
				elif command == 'CLOSE':
					db_open()
					log('Something has been Closed')
					db_close()
					pass
				self.result_q.put('Done')

			# nothing in queue continue on as normal
			except queue.Empty:
				pass

			#iterate through all sensors
			for sensor in sensors:

				# is sensor enable
				if sensor['enabled'] == 1:

					# get sensors current status - 0 or 1
					current = io.input(sensor['GPIO'])

					# is current status different than last status
					if current != sensor['current']:

						# Status
						if current == sensor['normal']:
							status = "Normal"
						else:
							status = "Abnormal"
							# buzz the buzzer
							self.buzz(settings['buzzer_pin'])

						# Send email if alarm is armed
						if settings['armed'] == 1:
							send_mail(sensor['zone'],sensor['name'],status)

						# Update sensor table in DB
						db_open()
						cur.execute('UPDATE sensors SET current = %d WHERE id = %d' % (current,sensor['id']))
						conn.commit()

						# update log table in DB
						sensorlog(sensor['id'],status)

						# Reload sensors
						load_sensors()

						# close DB
						db_close()

						# break out and start over
						break


		# we have been asked to quit so clean up after ourselves

	def join(self, timeout=None):
		self.stoprequest.set()
		super(AlarmMonitor, self).join(timeout)


#  ########  ########   #######  ##     ## #### ##     ## #### ######## ##    ##
#  ##     ## ##     ## ##     ##  ##   ##   ##  ###   ###  ##     ##     ##  ##
#  ##     ## ##     ## ##     ##   ## ##    ##  #### ####  ##     ##      ####
#  ########  ########  ##     ##    ###     ##  ## ### ##  ##     ##       ##
#  ##        ##   ##   ##     ##   ## ##    ##  ##     ##  ##     ##       ##
#  ##        ##    ##  ##     ##  ##   ##   ##  ##     ##  ##     ##       ##
#  ##        ##     ##  #######  ##     ## #### ##     ## ####    ##       ##
class ProximityMonitor(threading.Thread):

	def __init__(self, command_q, result_q):
		super(ProximityMonitor, self).__init__()
		self.command_q = command_q
		self.result_q = result_q
		self.stoprequest = threading.Event()
		self.startdt = datetime.datetime.now()
		print('proximity started')
		# open db
		#db_open()

		# Get ips

		# close db
		#db_close()

	def run(self):
		while not self.stoprequest.isSet():
			# Check if we were asked to do anything
			try:
				com = str(self.command_q.get(True, 0.05)).split('|')
				command = com[0].upper()
				try:
					arg = com[1]
				except:
					arg = ''
				if command == '':
					pass
				elif command == 'RELOAD':
					pass
				self.result_q.put('Done')

			# nothing in queue continue on as normal
			except queue.Empty:
				pass
			delta = datetime.datetime.now() - self.startdt


			if delta.seconds > 60:
				self.startdt = datetime.datetime.now()
				print('Checking for ips')
				db_open()
				for user in users:
					print(user['name'])
					if user['proximity_arm']:
						with open(os.devnull, 'r+') as nul:
							a = ''
							proc = subprocess.Popen(['ping',user['ip'], '-n', '1'],stdin=nul, stdout=subprocess.PIPE, stderr=nul)
							while True:
								line = proc.stdout.readline()
								if len(str(line)) > 5:
									a += str(line.rstrip())
								else:
									break
							if 'Reply from %s: bytes' % user['ip'] in a:
								cur.execute('UPDATE users SET last_seen=CURRENT_TIMESTAMP, location=1 WHERE id = %d' % user['id'])
								conn.commit()
							else:
								cur.execute('UPDATE users SET location=0 WHERE id=%d AND location!=0' % user['id'])
								conn.commit()
					else:
						print('  No Arm')
				db_close()
			#iterate through all ips
			#for sensor in sensors:

	def join(self, timeout=None):
		self.stoprequest.set()
		print('Proximity Stop')
		super(ProximityMonitor, self).join(timeout)



#        ########  ########           #######  ########  ######## ##    ##
#        ##     ## ##     ##         ##     ## ##     ## ##       ###   ##
#        ##     ## ##     ##         ##     ## ##     ## ##       ####  ##
#        ##     ## ########          ##     ## ########  ######   ## ## ##
#        ##     ## ##     ##         ##     ## ##        ##       ##  ####
#        ##     ## ##     ##         ##     ## ##        ##       ##   ###
#        ########  ########  #######  #######  ##        ######## ##    ##
# opens the database
def db_open():
	global conn
	global cur
	try:
		conn = pymysql.connect(
			host=script_settings['db']['host'],
		 	port=script_settings['db']['port'],
		  	user=script_settings['db']['user'],
		   	passwd=script_settings['db']['password'],
		    db=script_settings['db']['dbname']
		)
	except pymysql.err.OperationalError as oe:
		print(oe.args[1])
		# TODO: Define mysql info
		sys.exit(1)
	cur = conn.cursor()


#        ########  ########           ######  ##        #######   ######  ########
#        ##     ## ##     ##         ##    ## ##       ##     ## ##    ## ##
#        ##     ## ##     ##         ##       ##       ##     ## ##       ##
#        ##     ## ########          ##       ##       ##     ##  ######  ######
#        ##     ## ##     ##         ##       ##       ##     ##       ## ##
#        ##     ## ##     ##         ##    ## ##       ##     ## ##    ## ##
#        ########  ########  #######  ######  ########  #######   ######  ########
# closes the database
def db_close():
	global conn
	global cur
	cur.close()
	conn.close()


#         ######  ######## ##    ## ########     ######## ##     ##    ###    #### ##
#        ##    ## ##       ###   ## ##     ##    ##       ###   ###   ## ##    ##  ##
#        ##       ##       ####  ## ##     ##    ##       #### ####  ##   ##   ##  ##
#         ######  ######   ## ## ## ##     ##    ######   ## ### ## ##     ##  ##  ##
#              ## ##       ##  #### ##     ##    ##       ##     ## #########  ##  ##
#        ##    ## ##       ##   ### ##     ##    ##       ##     ## ##     ##  ##  ##
#         ######  ######## ##    ## ########     ######## ##     ## ##     ## #### ########
# Sends email
def send_mail(zone,name,status):
	if not script_settings:
		print('NO EMAIL')
		return
	else:
		print('Email Sent')
	return
	for user in users:
		recipients = []
		if (user[U_NOTIFY_EMAIL]) == 1:
			recipients.append(user[U_EMAIL])
		if int(user[U_NOTIFY_PHONE]) == 1:
			recipients.append(user[U_PHONE])
		if len(recipients) > 0:
			msg = MIMEText('''
        Zone: %s
        Name: %s
        Status: %s
        Time: %s
      ''' % (zone,name,status,datetime.datetime.now().strftime("%m/%d %H:%M:%S")))
			if status == 'Normal':
				msg['Subject'] = 'House Alarm Returned to Normal State'
			else:
				msg['Subject'] = 'House Alarm Triggered'
			msg['From'] = script_settings['smtp']['from']
			msg['To'] = ', '.join(recipients)
			server = smtplib.SMTP(script_settings['smtp']['address'])
			server.starttls()
			server.login(script_settings['smtp']['username'],script_settings['smtp']['password'])
			server.sendmail(script_settings['smtp']['from'], recipients, str(msg))
			server.quit()


#        ##        #######   ######
#        ##       ##     ## ##    ##
#        ##       ##     ## ##
#        ##       ##     ## ##   ####
#        ##       ##     ## ##    ##
#        ##       ##     ## ##    ##
#        ########  #######   ######
# Writes to the log without supplying a sensor id - for generic messages
def log(str):
  sensorlog(0,str)

# Writes to the log about a specific sensor
def sensorlog(sid,str):
  cur.execute("INSERT INTO logs(sid,message,createdAt,updatedAt) VALUES(%s,%s,%s,%s)",(sid,str,datetime.datetime.utcnow(),datetime.datetime.utcnow()))
  conn.commit()


#        ##        #######     ###    ########      ######  ######## ##    ##  ######   #######  ########   ######
#        ##       ##     ##   ## ##   ##     ##    ##    ## ##       ###   ## ##    ## ##     ## ##     ## ##    ##
#        ##       ##     ##  ##   ##  ##     ##    ##       ##       ####  ## ##       ##     ## ##     ## ##
#        ##       ##     ## ##     ## ##     ##     ######  ######   ## ## ##  ######  ##     ## ########   ######
#        ##       ##     ## ######### ##     ##          ## ##       ##  ####       ## ##     ## ##   ##         ##
#        ##       ##     ## ##     ## ##     ##    ##    ## ##       ##   ### ##    ## ##     ## ##    ##  ##    ##
#        ########  #######  ##     ## ########      ######  ######## ##    ##  ######   #######  ##     ##  ######
# loads all sensors into list
def load_sensors():
	global sensors
	cur.execute("SELECT * FROM sensors")
	columns = tuple( [d[0] for d in cur.description] )
	sensors = []
	for row in cur:
		sensors.append(dict(zip(columns, row)))



#        ##        #######     ###    ########      ######  ######## ######## ######## #### ##    ##  ######    ######
#        ##       ##     ##   ## ##   ##     ##    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
#        ##       ##     ##  ##   ##  ##     ##    ##       ##          ##       ##     ##  ####  ## ##        ##
#        ##       ##     ## ##     ## ##     ##     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
#        ##       ##     ## ######### ##     ##          ## ##          ##       ##     ##  ##  #### ##    ##        ##
#        ##       ##     ## ##     ## ##     ##    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
#        ########  #######  ##     ## ########      ######  ########    ##       ##    #### ##    ##  ######    ######
# loads house settings
def load_settings():
	global settings
	cur.execute("SELECT * FROM houses")
	result = []
	columns = tuple( [d[0] for d in cur.description] )
	for row in cur:
		result.append(dict(zip(columns, row)))
	if len(result) > 0:
		settings = result[0];
	result = None


# loads all users into list
def load_users():
	global users
	cur.execute("SELECT * FROM users")
	columns = tuple( [d[0] for d in cur.description] )
	users = []
	for row in cur:
		users.append(dict(zip(columns, row)))

#   ######  ######## ######## ##     ## ########      ######  ##    ##  ######  ######## ######## ##     ##
#  ##    ## ##          ##    ##     ## ##     ##    ##    ##  ##  ##  ##    ##    ##    ##       ###   ###
#  ##       ##          ##    ##     ## ##     ##    ##         ####   ##          ##    ##       #### ####
#   ######  ######      ##    ##     ## ########      ######     ##     ######     ##    ######   ## ### ##
#        ## ##          ##    ##     ## ##                 ##    ##          ##    ##    ##       ##     ##
#  ##    ## ##          ##    ##     ## ##           ##    ##    ##    ##    ##    ##    ##       ##     ##
#   ######  ########    ##     #######  ##            ######     ##     ######     ##    ######## ##     ##
# Setup the pi
def setup_system():
	for sensor in sensors:
		pass

def g_shutdown():
	db_open()
	log('The server has been shutdown')
	db_close()
	# shutdown threads
	if proximity_thread != None:
		proximity_thread.join()
	alarm_thread.join()
	return 'SHUTDOWN'

def g_restart():
	db_open()
	log('The server has been restarted')
	db_close()
	# shutdown threads
	if proximity_thread != None:
		proximity_thread.join()
	alarm_thread.join()
	# write the restart file, this is only used in testing and then only by start.ps1
	with open('restart.txt','w') as f:
		f.write('ss')
	return 'SHUTDOWN'

def g_proximity_start():
	global proximity_thread, proximity_command_q, proximity_result_q
	if proximity_thread == None:
		proximity_thread = ProximityMonitor(command_q=proximity_command_q, result_q=proximity_result_q)
		proximity_thread.start()
		db_open()
		cur.execute("UPDATE houses SET proximity_arm = 1")
		conn.commit()
		load_settings()
		db_close()
		return 'SUCCESS'
	else:
		return 'ALREADY RUNNING'

def g_proximity_shutdown():
	global proximity_thread
	if proximity_thread != None:
		db_open()
		cur.execute("UPDATE houses SET proximity_arm = 0")
		conn.commit()
		load_settings()
		db_close()
		proximity_thread.join()
		proximity_thread = None
		return 'SUCCESS'
	else:
		return 'NOT RUNNING'


#        ##     ##    ###    #### ##    ##
#        ###   ###   ## ##    ##  ###   ##
#        #### ####  ##   ##   ##  ####  ##
#        ## ### ## ##     ##  ##  ## ## ##
#        ##     ## #########  ##  ##  ####
#        ##     ## ##     ##  ##  ##   ###
#        ##     ## ##     ## #### ##    ##
def main(args):
	global alarm_thread, proximity_thread, time_thread
	global proximity_command_q, proximity_result_q
	# Load script settings
	global script_settings
	if os.path.exists('settings.json'):
		json_data=open('settings.json').read()
		script_settings = json.loads(json_data)
	else:
		print('Copy settings.example.json to settings.json and add your info to it')
		sys.exit(0)

	# load house settings
	db_open()
	load_settings()
	load_users()
	db_close()

	# Create a single input and a single output queue for all alarm monitor threads.
	command_q = queue.Queue()
	result_q = queue.Queue()
	# Create a single input and a single output queue for all proximity monitor threads.
	proximity_command_q = queue.Queue()
	proximity_result_q = queue.Queue()

	# Alarm monitor thread
	alarm_thread = AlarmMonitor(command_q=command_q, result_q=result_q)
	alarm_thread.start()

	# Proximity monitor thread | dont start if system is already armed
	if settings['proximity_arm'] == 1 and settings['armed'] == 0:
		proximity_thread = ProximityMonitor(command_q=proximity_command_q, result_q=proximity_result_q)
		proximity_thread.start()
	else:
		proximity_thread = None

	# socket server!!
	import socket

	host = '127.0.0.1'
	port = 50000
	backlog = 5
	size = 1024
	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	s.bind((host,port))
	s.listen(backlog)
	db_open()
	log('The server is running')
	print('The server is running')
	db_close()
	while 1:
		client, address = s.accept()
		data = client.recv(size)

		# do something with the data we received
		if data:
			line = data.decode()
			if line == '?':
				client.close()
				break
			try:
				response = globals()['g_%s' % line]()
				if response == 'SHUTDOWN':
					break
			except:
				print('No Function named %s' % line)
				command_q.put(line)
				response = result_q.get()
			client.send(response.encode())
		client.close()
	s.close()





if __name__ == '__main__':
	import sys
	main(sys.argv[1:])

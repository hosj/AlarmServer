import socket 
import sys
if len(sys.argv) == 1:
	print('Say something')
else:
	args = iter(sys.argv)
	host = 'localhost' 
	port = 50000 
	size = 1024 
	s = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
	s.connect((host,port))
	next(args)
	for arg in args:
		s.send(arg.encode())
	s.close() 
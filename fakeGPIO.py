import os
IN = 0
OUT = 1
BCM = 1
PUD_UP = 1
def setmode(val):
    pass

def setup(pin,direction):
    pass

def output(pin,val):
    print('OUTPUT on pin %d: %s' % (pin,str(val)))
    pass

def input(pin):
    try:
        if not os.path.isdir('GPIO'):
            os.mkdir('GPIO')
        with open(os.path.join('GPIO','%d.txt' % pin)) as f:
            val = int(f.readlines()[0])
    except:
        val = 0
    return val

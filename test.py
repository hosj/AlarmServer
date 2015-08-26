import nmap
nm = nmap.PortScanner()
# Vendor list for MAC address
nm.scan('192.168.1.0/24', arguments='-O')
for h in nm.all_hosts():
    if 'mac' in nm[h]['addresses']:
        print(nm[h]['addresses'], nm[h]['vendor'])

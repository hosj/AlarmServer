Do {
  if((Test-Path restart.txt))
  {
    Remove-Item restart.txt
  }
  Start-Process python AlarmServer.py -NoNewWindow -Wait
}
while (Test-Path restart.txt)

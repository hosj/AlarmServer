@echo off
if '%1' == '' goto EOF
if '%2' == '' goto EOF 


echo %2 > GPIO\%1.txt




:EOF
SET Resolution=1280x720
SET SMALL_EXTENSION=small
#-s %Resolution%
# -b:a 128k  
#-b:v 1M -b:a 1M
SET CurrDir=%CD%
#dir *.MOV /b  > downloadurl.txt
for /f "delims=" %%x in ('dir *.MP4 /b') do ( 
ffmpeg.exe -i "%%x" -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus "%%x.webm"
)
#del downloadurl.txt
exit




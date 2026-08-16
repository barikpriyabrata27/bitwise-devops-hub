# CD: NAS (Windows)

Deploying a released artifact to a Windows-hosted NAS (e.g. a Windows file
share or a lightweight Windows service host).

Demonstrated in: [bitwise-devops-nasw](https://github.com/barikpriyabrata27/bitwise-devops-nasw)

Typical shape: copy the zipped artifact to the NAS share (SMB/robocopy), then
restart the service/scheduled task that runs it. See the repo's own README
for the exact steps.

Back to [CD overview](README.md).

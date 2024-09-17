**NodeJS 18.20.4**
**NPM 10.7.0**

**БД: mysql 2.18.1**
**Файл конфига: `config.js`**

## Настройка systemd

```bash=
sudo chown -R user:group /path/to/project/
sudo chmod -R 755 /path/to/project/
sudo nano /etc/systemd/system/warranty_bot.service
```

```c#=
[Unit]
Description=warrantybot
After=network.target

[Service]
User=root
ExecStart=/usr/bin/node /path/to/project/Index.js
WorkingDirectory=/path/to/project/
Restart=always

StandardOutput=file:/path/to/project/logs/output.log
StandardError=file:/path/to/project/logs/error.log

[Install]
WantedBy=multi-user.target
```

```bash=
sudo systemctl daemon-reload
sudo systemctl start warranty_bot

# Просмотр логов
journalctl -u warrantybot -f

# Также логи сохраняются по пути /path/to/project/logs
```
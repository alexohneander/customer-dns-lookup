domains = comvalue.com, www.comvalue.com
agree-tos = True
renew-by-default = True
non-interactive = True
rsa-key-size = 4096
server = https://acme-v01.api.letsencrypt.org/directory
email = c.nagel@comvalue.com
text = True
authenticator = webroot
webroot-path = /var/www/letsencrypt
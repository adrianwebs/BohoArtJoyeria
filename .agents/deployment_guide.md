# 🚀 Guía de Despliegue en VPS con SQL Server, Docker y CI/CD

Esta guía detalla el paso a paso exacto para poner en producción **Bohoart Jewelry** en tu servidor VPS (Ubuntu / Debian), levantar la base de datos **Microsoft SQL Server**, aplicar las migraciones de Prisma y configurar el modo mantenimiento por IP.

---

## 1. Requisitos en el Servidor VPS

Conéctate por SSH a tu servidor VPS y asegúrate de tener Docker instalado:

```bash
# 1. Actualizar paquetes e instalar Docker si no lo tienes
sudo apt-get update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 2. Configurar la Base de Datos Microsoft SQL Server

Tienes 2 opciones para tu base de datos:

### Opción A: Usar el contenedor de SQL Server incluido en Docker Compose (Recomendada y más fácil)
El archivo `docker-compose.yml` del proyecto ya incluye el servicio `sqlserver` listo con persistencia de datos en volúmenes de Docker. Solo necesitas definir la contraseña `sa` en tu archivo `.env`.

### Opción B: Conectar a una instancia de SQL Server externa existente
Si ya tienes SQL Server instalado en tu VPS o en Azure SQL / AWS RDS, simplemente apunta tu `DATABASE_URL` hacia esa IP/Host.

---

## 3. Configuración de Variables de Entorno en Producción (`.env`)

Crea un archivo `.env` en tu servidor en la ruta `/docker/clientes/bohoart/.env` con tus datos reales:

```env
# Next.js y Entorno
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bohoartjoyeria.com
PORT=3000

# Base de datos Microsoft SQL Server (Si usas el docker-compose interno, el host es 'sqlserver')
DATABASE_URL="sqlserver://sqlserver:1433;database=BohoartDB;user=sa;password=TuPasswordSeguro123!;encrypt=true;trustServerCertificate=true"
MSSQL_SA_PASSWORD=TuPasswordSeguro123!

# Claves de Autenticación
JWT_SECRET=genera_una_clave_aleatoria_larga_de_64_caracteres_aqui
ADMIN_EMAIL=admin@bohoartjoyeria.com
ADMIN_PASSWORD=TuClaveAdminMuySegura2026!

# Modo Mantenimiento & IPs Autorizadas (Opcional - también editable en /admin/configuracion)
MAINTENANCE_MODE=false
MAINTENANCE_ALLOWED_IPS="127.0.0.1, ::1, TU_IP_PUBLICA_AQUI"

# Pasarela PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sb
PAYPAL_CLIENT_SECRET=tu_paypal_secret_aqui
PAYPAL_MODE=sandbox
```

---

## 4. Despliegue Inicial en el Servidor VPS

```bash
# 1. Crear carpeta del cliente y clonar el repositorio
mkdir -p /docker/clientes/bohoart
git clone https://github.com/adrianwebs/BohoArtJoyeria.git /docker/clientes/bohoart
cd /docker/clientes/bohoart

# 2. Configurar las variables
cp .env.example .env
nano .env

# 3. Construir y levantar los contenedores con Traefik
docker compose up -d --build

# 4. Crear las tablas en SQL Server y sembrar los datos iniciales
docker compose exec bohoart npx prisma db push
docker compose exec bohoart npm run db:seed
```

---

## 5. Configurar Dominio y SSL (Nginx Reverso)

En tu VPS, crea la configuración de Nginx para redirigir el tráfico a `http://localhost:3000`:

```nginx
# /etc/nginx/sites-available/bohoartjoyeria.com
server {
    server_name bohoartjoyeria.com www.bohoartjoyeria.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activa el sitio y genera el certificado SSL gratuito:
```bash
sudo ln -s /etc/nginx/sites-available/bohoartjoyeria.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d bohoartjoyeria.com -d www.bohoartjoyeria.com
sudo systemctl reload nginx
```

---

## 6. Despliegue Automático Continuo con GitHub Actions (CI/CD)

En tu repositorio de GitHub, añade los siguientes **Secrets** en **Settings > Secrets and variables > Actions**:

1. `VPS_HOST`: La IP pública de tu servidor VPS.
2. `VPS_USERNAME`: Tu usuario SSH (por ejemplo `root` o `deploy`).
3. `VPS_SSH_KEY`: Tu clave privada SSH (la clave pública debe estar en `~/.ssh/authorized_keys` del VPS).
4. `VPS_PORT`: Puerto SSH (generalmente `22`).

¡Listo! Cada vez que hagas `git push origin main`, GitHub compilará el proyecto, lo enviará al VPS y reiniciará los contenedores de forma transparente sin caídas.

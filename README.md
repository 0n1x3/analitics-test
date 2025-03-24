# 1. Запустите контейнеры
docker-compose -f cube/docker-compose-local.yml up -d

# 2. Подождите 10 секунд для запуска MySQL
sleep 10

# 3. Скопируйте скрипт создания таблиц
docker cp create-tables.sql cube-mysql-1:/tmp/

# 4. Выполните скрипт создания таблиц
docker exec -i cube-mysql-1 mysql --default-character-set=utf8mb4 -u root -proot calc < create-tables.sql

# 5. Проверьте, что таблицы созданы
docker exec -i cube-mysql-1 mysql -u root -proot calc -e "SHOW TABLES;"

# 6. Скопируйте скрипт заполнения данных
docker cp init-data.sql cube-mysql-1:/tmp/

# 7. Выполните скрипт заполнения данных
docker exec -i cube-mysql-1 mysql --default-character-set=utf8mb4 -u root -proot calc < init-data.sql

# 8. Перезапустите Cube.js
docker restart cube-cube-1
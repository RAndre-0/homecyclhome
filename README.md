### Applications Front
Lancer `npm install` à la racine du projet.

### API Symfony
Lancer `composer install` à la racine du projet.  
Créer un dossier JWT dans le dossier config.  
Lancer `php bin/console lexik:jwt:generate-keypair`  
Copier le fichier .env et renommer la copie .env.local puis adapter les valeurs suivantes :  
- DATABASE_URL : Votre URL de base de données
- JWT_PASSPHRASE : Suite de caractère secrète au choix  
Créer la base de données avec la commande `symfony console doctrine:database:create`
Lancer les fixtures via la commande `symfony console doctrine:fixtures:load`
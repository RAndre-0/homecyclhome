<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250101174844 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE modele_interventions_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE modele_planning_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE modele_interventions (id INT NOT NULL, type_intervention_id INT DEFAULT NULL, modele_intervention_id INT DEFAULT NULL, intervention_time TIME(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1E51F4AA799AAC17 ON modele_interventions (type_intervention_id)');
        $this->addSql('CREATE INDEX IDX_1E51F4AA6056A4E3 ON modele_interventions (modele_intervention_id)');
        $this->addSql('CREATE TABLE modele_planning (id INT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE modele_interventions ADD CONSTRAINT FK_1E51F4AA799AAC17 FOREIGN KEY (type_intervention_id) REFERENCES type_intervention (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE modele_interventions ADD CONSTRAINT FK_1E51F4AA6056A4E3 FOREIGN KEY (modele_intervention_id) REFERENCES modele_planning (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE modele_interventions_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE modele_planning_id_seq CASCADE');
        $this->addSql('ALTER TABLE modele_interventions DROP CONSTRAINT FK_1E51F4AA799AAC17');
        $this->addSql('ALTER TABLE modele_interventions DROP CONSTRAINT FK_1E51F4AA6056A4E3');
        $this->addSql('DROP TABLE modele_interventions');
        $this->addSql('DROP TABLE modele_planning');
    }
}

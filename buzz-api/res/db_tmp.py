from django.db import migrations

# ALTER TABLE task_entityservice ALTER COLUMN currency_id TYPE varchar(5);

migrations.RunSQL(
    sql='''
ALTER TABLE task_entityservice ALTER COLUMN currency_id TYPE varchar(5);
alter table task_entityservice
add constraint task_entityservice_locale_currency_code_fk
foreign key (currency_id) references locale_currency on delete restrict;

    ''',
)
# migrations.RunSQL(
#     sql='ALTER TABLE task_task ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE subscription_subscriptionplan ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE locale_exchangerate ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE locale_country ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE payment_order ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE payment_transaction ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE wallet_wallet ALTER COLUMN currency_id TYPE varchar(5);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE offer_offer ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE locale_city ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE payment_bank ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE payment_paymentmethod ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE tasker_profile ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE tasker_kyc ALTER COLUMN country_id TYPE varchar(3);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE locale_country ALTER COLUMN language_id TYPE varchar(16);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE tasker_profile ALTER COLUMN language_id TYPE varchar(16);',
# ),
# migrations.RunSQL(
#     sql='ALTER TABLE tasker_profile ALTER COLUMN charge_currency_id TYPE varchar(5);',
# ),

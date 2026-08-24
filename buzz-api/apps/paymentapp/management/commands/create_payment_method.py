import os
import json
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction
from apps.paymentapp.models import PaymentMethod


class Command(BaseCommand):
    help = 'Import PaymentMethod data from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('excel_file_path', type=str, help='Path to Excel file')

    def handle(self, *args, **kwargs):
        file_path = kwargs['excel_file_path']

        if not os.path.exists(file_path):
            raise CommandError(f"File does not exist: {file_path}")

        try:
            # Read as string to avoid pandas type guessing issues
            df = pd.read_excel(file_path, dtype=str)
            df = df.fillna('')  # NaN → empty string
        except Exception as e:
            raise CommandError(f"Error reading Excel file: {str(e)}")

        imported = 0
        skipped = 0

        for index, row in df.iterrows():
            row_num = index + 2  # Excel row number (1-based + header)
            name = row.get('name', '').strip()

            if not name:
                self.stdout.write(self.style.WARNING(f"⚠️ Row {row_num}: Skipping — no name"))
                skipped += 1
                continue

            try:
                with transaction.atomic():

                    # Prepare extra_args JSON — store everything we can't map directly
                    extra_args = {}

                    # Move all "extra" columns into extra_args
                    possible_extra_keys = [
                        'country', 'is_partner', 'allow_withdraw', 'allow_deposit',
                        'type', 'deposit_rate', 'withdraw_rate',
                        # add any other unexpected columns you might have
                    ]

                    for key in possible_extra_keys:
                        val = row.get(key, '')
                        if val != '':
                            # Try to convert numbers/strings sensibly
                            if val.lower() in ('true', 'false', 'yes', 'no', '1', '0'):
                                extra_args[key] = val.lower() in ('true', 'yes', '1')
                            elif '.' in val or val.isdigit():
                                try:
                                    extra_args[key] = float(val)
                                except ValueError:
                                    extra_args[key] = val.strip()
                            else:
                                extra_args[key] = val.strip()

                    # Also include any completely unexpected columns
                    for col in df.columns:
                        if col not in [
                            'name', 'description', 'slug', 'logo', 'thumbnail',
                            'is_active', 'client_id', 'public_key', 'secret_key',
                            'extra_args'
                        ] and col not in possible_extra_keys:
                            val = row.get(col, '')
                            if val:
                                extra_args[col] = val.strip()

                    # If there's already an 'extra_args' column with JSON, merge it
                    existing_extra = row.get('extra_args', '')
                    if existing_extra.strip():
                        try:
                            parsed = json.loads(existing_extra)
                            if isinstance(parsed, dict):
                                extra_args = {**parsed, **extra_args}  # merge, command values win
                        except json.JSONDecodeError:
                            self.stdout.write(self.style.WARNING(
                                f"Row {row_num} ({name}): Invalid JSON in 'extra_args' column — ignored"
                            ))

                    # Boolean helper
                    def to_bool(val, default=True):
                        if val == '':
                            return default
                        val_str = str(val).lower().strip()
                        return val_str in ('true', 'yes', '1', 'y', 't')

                    PaymentMethod.objects.create(
                        name=name,
                        description=row.get('description', '').strip() or None,
                        slug=row.get('slug', '').strip() or None,
                        logo=row.get('logo', '').strip() or None,
                        thumbnail=row.get('thumbnail', '').strip() or None,
                        is_active=to_bool(row.get('is_active', ''), default=True),
                        client_id=row.get('client_id', '').strip() or None,
                        public_key=row.get('public_key', '').strip() or None,
                        secret_key=row.get('secret_key', '').strip() or None,
                        extra_args=extra_args if extra_args else None,  # null if empty
                    )

                imported += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Row {row_num}: Imported {name}"))

            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(
                    f"❌ Row {row_num} ({name}): Integrity error (duplicate slug?) — {str(e)}"
                ))
                skipped += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"❌ Row {row_num} ({name}): {str(e)}"
                ))
                skipped += 1

        self.stdout.write("\n")
        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {imported} successful, {skipped} skipped/failed"
        ))
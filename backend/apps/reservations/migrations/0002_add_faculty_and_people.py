from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='faculty',
            field=models.CharField(default='', max_length=120, blank=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='number_of_people',
            field=models.PositiveSmallIntegerField(default=1),
        ),
    ]

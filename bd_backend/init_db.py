from app import db, app
with app.app_context():
    db.drop_all()
    db.create_all()
    db.session.commit()
    print("База данных успешно инициализирована")
    print("Все таблицы были удалены и созданы заново")

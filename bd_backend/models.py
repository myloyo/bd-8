from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Country(db.Model):
    __tablename__ = 'country'
    id_country = db.Column(db.Integer, primary_key=True)
    name_country = db.Column(db.String(30))

class Season(db.Model):
    __tablename__ = 'season'
    id_season = db.Column(db.Integer, primary_key=True)
    name_season = db.Column(db.String(30))

class Chief(db.Model):
    __tablename__ = 'chief'
    id_chief = db.Column(db.Integer, primary_key=True)
    name_chief = db.Column(db.String(30))
    id_country = db.Column(db.Integer, db.ForeignKey('country.id_country'))
    exp_years = db.Column(db.Integer)

class DishType(db.Model):
    __tablename__ = 'dish_type'
    id_group = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30))

class Dish(db.Model):
    __tablename__ = 'dish'
    id_dish = db.Column(db.Integer, primary_key=True)
    name_dish = db.Column(db.String(30))
    id_season = db.Column(db.Integer, db.ForeignKey('season.id_season'))
    id_country = db.Column(db.Integer, db.ForeignKey('country.id_country'))
    id_group = db.Column(db.Integer, db.ForeignKey('dish_type.id_group'))
    id_chief = db.Column(db.Integer, db.ForeignKey('chief.id_chief'))
    recipes = db.relationship('Recipe', backref='dish', lazy=True)

class Human(db.Model):
    __tablename__ = 'human'
    id_user = db.Column(db.Integer, primary_key=True)
    name_user = db.Column(db.String(30))
    email = db.Column(db.String(50))
    age = db.Column(db.Date)
    id_country = db.Column(db.Integer, db.ForeignKey('country.id_country'))
    sex = db.Column(db.String(10))
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)

class DishRating(db.Model):
    __tablename__ = 'dish_rating'
    id_rate = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('human.id_user'))
    id_dish = db.Column(db.Integer, db.ForeignKey('dish.id_dish'))
    rate = db.Column(db.Integer)
    comment = db.Column(db.String(255))
    date = db.Column(db.Date)

class Product(db.Model):
    __tablename__ = 'product'
    id_prod = db.Column(db.Integer, primary_key=True)
    name_product = db.Column(db.String(30))
    calories = db.Column(db.Integer)
    cost_product = db.Column(db.Integer)
    id_season = db.Column(db.Integer, db.ForeignKey('season.id_season'))

class Recipe(db.Model):
    __tablename__ = 'recipe'
    id_dish = db.Column(db.Integer, db.ForeignKey('dish.id_dish'), primary_key=True)
    id_product = db.Column(db.Integer, db.ForeignKey('product.id_prod'), primary_key=True)
    gramms = db.Column(db.Integer)

class OrderOfDishes(db.Model):
    __tablename__ = 'order_of_dishes'
    id_order = db.Column(db.Integer, primary_key=True)
    id_dish = db.Column(db.Integer, db.ForeignKey('dish.id_dish'))
    id_user = db.Column(db.Integer, db.ForeignKey('human.id_user'))
    date = db.Column(db.Date)

from models import db, Dish, Recipe, Season, Chief, Product


def calculate_dish_cost(dish_id):
    dish = Dish.query.get(dish_id)
    if not dish:
        return 0
    total_cost = 0
    for recipe in dish.recipes:
        product = Product.query.get(recipe.id_product)
        if product:
            total_cost += (recipe.gramms / 1000) * product.cost_product
    return round(total_cost, 2)


def get_seasonal_dishes(season_name):
    season = Season.query.filter_by(name_season=season_name).first()
    if not season:
        return []
    return Dish.query.filter_by(id_season=season.id_season).all()


def change_dish_chef(dish_id, new_chef_id):
    dish = Dish.query.get(dish_id)
    if not dish:
        return {'success': False, 'message': 'Dish not found'}

    new_chief = Chief.query.get(new_chef_id)
    if not new_chief:
        return {'success': False, 'message': 'Chief not found'}

    old_chef_id = dish.id_chief
    dish.id_chief = new_chef_id
    db.session.commit()

    return {
        'success': True,
        'message': 'Chef changed successfully',
        'old_chef_id': old_chef_id,
        'new_chef_id': new_chef_id
    }

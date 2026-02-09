from sqlalchemy.orm import Session
import models,schemas

def create_todo(db:Session,todo:schemas.TodoCreate):
    new_todo=models.Todo(
        title=todo.title,
        description=todo.description
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo
def get_todos(db:Session,status:str=None):
    query= db.query(models.Todo)
    if status =="completed":
        query= query.filter(models.Todo.completed==True)
    if status == "pending":
        query= query.filter(models.Todo.completed==False)
    return query.all()
def get_todo_by_Id(db:Session,todo_id:int):
    return db.query(models.Todo).filter(models.Todo.id==todo_id).first()
def update_todo(db:Session,todo_id:int ,todo_data:schemas.TodoUpdate):
    todo= get_todo_by_Id(db,todo_id)
    if not todo:
        return None
    
    if todo_data.title is not None:
        todo.title= todo_data.title
    if todo_data.description is not None:
        todo.description=todo_data.description
    if todo_data.completed is not None:
        todo.completed=todo_data.completed
    
    db.commit()
    db.refresh(todo)
    return todo
def delete_todo(db: Session, todo_id: int):
    todo = get_todo_by_Id(db, todo_id)
    if not todo:
        return None
    db.delete(todo)
    db.commit()
    return todo
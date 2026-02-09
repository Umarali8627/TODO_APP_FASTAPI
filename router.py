from fastapi import FastAPI,HTTPException,Depends,APIRouter
from sqlalchemy.orm import Session
from database import sessionlocal
from typing import Optional
import crud,schemas

router= APIRouter(prefix="/todos",tags=["Todos"])

# now get the db 
def get_db():
    db=sessionlocal()
    try:
        yield db 
    finally:
        db.close()
# insert todo list 
@router.post("/add",response_model=schemas.TodoResponse)
def insert(todo:schemas.TodoCreate,db:Session=Depends(get_db)):
    return crud.create_todo(db,todo)
@router.get("/getall",response_model=list[schemas.TodoResponse])
def get_all(status : Optional[str]=None,db:Session=Depends(get_db)):
    return crud.get_todos(db,status)
@router.get("/getbyid/{id:int}",response_model=schemas.TodoResponse)
def getbyId(id:int,db:Session=Depends(get_db)):
    todo= crud.get_todo_by_Id(db,id)
    if not todo:
        raise HTTPException(status_code=404,detail=f"todo not found with this Id{id}")
    return todo
@router.put("/update/{id:int}",response_model=schemas.TodoResponse)
def updatebyId(id:int,todo_data:schemas.TodoUpdate,db:Session=Depends(get_db)):
    todo=crud.update_todo(db,id,todo_data)
    if not todo :
        raise HTTPException(status_code=404,detail="Todo not avialible ")
    return todo
@router.delete("/delete/{id:int}")
def delete(id:int,db:Session=Depends(get_db)):
    todo=crud.delete_todo(db,id)
    if not todo:
        raise HTTPException(status_code=404,detail="Todo not Found")
    return {"message":"Todo Deleted Successfully"}
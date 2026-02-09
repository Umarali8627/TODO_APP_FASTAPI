from pydantic import BaseModel,Field
from typing import Optional
from datetime import datetime

class TodoCreate(BaseModel):
    title : str=Field(...,description="title of the todo")
    description : Optional[str]=None

class TodoUpdate(BaseModel):
    title:Optional[str]=None
    description: Optional[str]=None
    completed:Optional[str]=None
class TodoResponse(BaseModel):
    id:int
    title:str
    description:str
    completed:bool
    created_at:datetime
    
    class config:
        orm_mode=True
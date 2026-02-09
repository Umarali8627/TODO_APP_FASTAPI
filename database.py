from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

# Define the database url
DataBase_Url= "sqlite:///./todo.db"
# now create the engine
engine = create_engine(DataBase_Url,connect_args={"check_same_thread":False})
# create session 
sessionlocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
# create the base
Base = declarative_base()


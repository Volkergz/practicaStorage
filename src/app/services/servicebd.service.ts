import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //variable de conexión a la Base de Datos
  public database!: SQLiteObject;

  //variables de creación de tablas
  tablaNoticia: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";
  
  registroNoticia: string = "INSERT INTO noticia(titulo, texto) VALUES('Noticia 1', 'Texto de la noticia 1');";

  //Variable para guardar registros de un SELECT (ResulSet)
  //Es Observable a secas, ahi almacenaremos la configuración
  listadoNoticias = new BehaviorSubject([]); //-> el [] significa que es un arreglo con todos los registros que traiga la consulta 

  //Variable para manipular el estado de la BD
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqlite:SQLite, private platform:Platform, private alertController:AlertController) {
    this.crearDB();
  }

  //Funcion para un observable de tipo Noticias (una clase)
  fetchNoticias():Observable<Noticias[]> {
    return this.listadoNoticias.asObservable();
  }

  //Función para observar el estado de la BD (Creada o no)
  dbState(){
    return this.isDBReady.asObservable();
  }

  //Codigo de alertas
  async presentAlert(titulo:string, mensaje:string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    //Mostrar la alerta
    await alert.present();
  }

  //Metodo para crear una nueva DB en el dispositivo
  crearDB(){
    this.platform.ready().then(() => {
      //Crear la base de datos
      //Si existe obtiene la conexión
      this.sqlite.create({
        name: 'noticias.db',
        location: 'default'
      })
      //Si no esta creada, la crea
      //Si existe, obtiene la conexión
      .then((db:SQLiteObject) => {
        //Si crear la DB, guarda ese objeto en el atributo database
        this.database = db;
        this.crearTablas();
      })
      //Si ocurre un error (Ya existe la BD)
      .catch(error => {
        this.presentAlert('Creación BD', "Error creando la base de datos:" + JSON.stringify(error));
      });
    });
  }

  //Metodo para crear las tablas en la BD
  async crearTablas(){
    //Validación del estado de la DB
    try {
    //Crear la tabla de noticia
    await this.database.executeSql(this.tablaNoticia, [])
    
    //Poblar la tabla de noticia
    //executeSql(sentenciaEjecutar, [Parametros que necesite la sentencia])
    await this.database.executeSql(this.registroNoticia, [])
    } catch (error) {
      this.presentAlert('Poblado de Tablas', "Error al poblar las tablas:" + JSON.stringify(error));
    }
  }

  //Metodo para obtener todas las noticias
  /*
  async getNoticias(){
    try {
      this.listadoNoticias = await this.database.executeSql("SELECT * FROM noticia", []);
      let resultado = this.fetchNoticias();
      // Este seria el contenido de "resultado" -> [{id:0, titulo:"", texto:""}]
    } catch (error) {
      this.presentAlert('Consulta de Noticias', "Error al consultar las noticias:" + JSON.stringify(error));
    }
  }
  */
}

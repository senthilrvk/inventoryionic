import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { LoadingController } from '@ionic/angular';
import domtoimage from 'dom-to-image';
import  jsPDF from 'jspdf';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';

@Injectable()
export class DocShareService {
  
  constructor(private socialSharing: SocialSharing,private pdfGenerator: PDFGenerator,
     private file: File,private loadingCtrl: LoadingController) { }

   async fnSharepage(page: string, value:string) {
    const loading = await this.loadingCtrl.create({
      message: 'Creating PDF file...',
      backdropDismiss: true
    });
    await loading.present();
    
    let option = {
      documentSize: 'A4',
      type: 'base64',
     }
    
     
     setTimeout(() => {
      const divs = document.getElementById(page).innerHTML;
       const fileName = `${value}.pdf`;
       
      this.pdfGenerator.fromData(divs, option)
      .then((base64)=> {
        
        this.savebase64AsPDF(fileName, base64, loading);  
      })
      .catch((err)=> {
        console.error(err);
        loading.dismiss();
      })
     }, 500);
   
    return
  
    
    
    const div = document.getElementById(page);
    
    const options = { background: "white", height: div.clientWidth, width: div.clientHeight };
    
      domtoimage.toPng(div).then((dataUrl)=> {
        
       var doc = new jsPDF("p","mm","a4");
       doc.addImage(dataUrl, 'PNG', 5, 5,0, 0);
       //Add image Url to PDF
       let pdfOutput = doc.output();
       let buffer = new ArrayBuffer(pdfOutput.length);
       let array = new Uint8Array(buffer);
       for (var i = 0; i < pdfOutput.length; i++) {
         array[i] = pdfOutput.charCodeAt(i);
       }   
      
       const directory = this.file.cacheDirectory ;
       const fileName = `invoiceBill_${value}.pdf`;
       let options: IWriteOptions = { replace: true };
 
       this.file.checkFile(directory, fileName).then((success)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer, options)
         .then((success)=> {
           
           loading.dismiss();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('invoiceBill', null, directory + fileName, null);
           });
           
         }).catch((error)=> {
           loading.dismiss();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       }).catch((error)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer)
         .then((success)=> {
           loading.dismiss();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('invoiceBill', null, directory + fileName, null);
           });
         }).catch((error)=> {
           loading.dismiss();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       });
     }).catch(function (error) {
      //   console.log(this.loading);
      loading.dismiss();
      // if (this.loading) {
      //     this.loading.dismiss();
      //   }
       console.error('oops, something went wrong!', error);
     });
   
   }
  
   async savebase64AsPDF(fileName,content, loading) {
    const contentType = "application/pdf";
    const directory = this.file.dataDirectory;
    const buffer = b64toBlob(content,contentType, 0);
    const options: IWriteOptions = { replace: true };
 
    this.file.checkFile(directory, fileName).then((success)=> {
      //Writing File to Device
      this.file.writeFile(directory,fileName,buffer, options)
      .then((success)=> {
        loading.dismiss();
        console.log("File created Succesfully" + JSON.stringify(success));
        setTimeout(() => {
          this.socialSharing.share('invoiceBill', null, directory + fileName, null);
        });
        
      }).catch((error)=> {
        loading.dismiss();
        console.log("Cannot Create File " +JSON.stringify(error));
      });
    }).catch((error)=> {
      //Writing File to Device
      this.file.writeFile(directory,fileName,buffer)
      .then((success)=> {
        loading.dismiss();
        console.log("File created Succesfully" + JSON.stringify(success));
        setTimeout(() => {
          this.socialSharing.share('new', null, directory + fileName, null);
        });
      }).catch((error)=> {
        loading.dismiss();
        console.log("Cannot Create File " +JSON.stringify(error));
      });
    });
   }

   

}
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
  }

var blob = new Blob(byteArrays, {type: contentType});
return blob;
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPipe'
})
export class FilterPipePipe implements PipeTransform {
  transform(json:Array<any>, args?) {
        let searchText = new RegExp(args.keyword, 'ig');
        if (json) {
          return json.filter(brand => {
            if (brand[args.params]) {
              return brand[args.params].search(searchText) !== -1;
            }
          });
        }
}

}

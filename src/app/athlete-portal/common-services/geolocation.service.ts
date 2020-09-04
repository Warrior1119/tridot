import { Injectable } from '@angular/core';

export interface AddressInfo {
  country: string;
  state: string;
  city: string;
  zip: string;
}

@Injectable()
export class GeolocationService {

  getCurrentPosition() {
    return new Promise<{ coords: { longitude: number, latitude: number } }>((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve();
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              return reject('Failed to determine location: Denied the request for Geolocation. Maybe, ask the user in a more polite way?');
            case error.POSITION_UNAVAILABLE:
              return reject('Failed to determine location: Location information is unavailable.');
            case error.TIMEOUT:
              return reject('Failed to determine location: The request to get location timed out.');
            default:
              return reject(`Failed to determine location: ${error.message}`);
          }
        },
        {
          // should the device take extra time or power to return a really accurate result, or should it give you the quick (but less accurate) answer?
          enableHighAccuracy: false,
          // how long does the device have, in milliseconds to return a result?
          timeout: 5000,
          // maximum age for a possible previously-cached position. 0 = must return the current position, not a prior cached position
          maximumAge: 0
        });
    });
  }
  
  async getAddress({ latitude, longitude }) {
      const results = await this.geocode(latitude, longitude);
      if (!results || !results.length) {
        return;
      }

      const {address_components} = results[0];
      const city = this.getAddressComponent(address_components, 'locality');
      const state = this.getAddressComponent(address_components, 'administrative_area_level_1');
      const country = this.getAddressComponent(address_components, 'country');
      const zip = this.getAddressComponent(address_components, 'postal_code');
      
      return { 
        country: country && country.short_name, 
        state: state && state.short_name,
        city: city && city.short_name,
        zip: zip && zip.short_name,
      } as AddressInfo;
  }

  geocode(latitude, longitude) {
    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      new google.maps.Geocoder()
      .geocode(
        { 'latLng': new google.maps.LatLng(latitude, longitude) } as any, 
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            resolve(results);
          } else {
            reject({results, status});
          }
        }); 
    });
  }

  getAddressComponent(addressComponents, type: string) {
    return addressComponents.find(x => x.types.includes(type));
  }

}

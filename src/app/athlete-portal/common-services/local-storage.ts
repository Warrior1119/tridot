import { Injectable } from '@angular/core';
import { LocalStorageService as Ng2LocalStorage } from 'ngx-webstorage' ;

@Injectable()
export class LocalStorage {
    constructor(private _localStorage: Ng2LocalStorage) {}

    get<T = any>(key: string, defaultValue?: T) {
        return (this._localStorage.retrieve(key) || defaultValue) as T;
    }

    set(key: string, value) {
        this._localStorage.store(key, value);
    }

    clear(key?: string) {
        this._localStorage.clear(key);
    }

}
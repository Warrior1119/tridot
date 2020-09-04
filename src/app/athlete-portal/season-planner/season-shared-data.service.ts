import { Injectable } from '@angular/core';

export const raceCategory = [
  {
      'racePriority': 'A',
      'raceDistances':
      [
        {
          'catId': '1',
          'catName': 'Sprint'
        },
        {
          'catId': '2',
          'catName': 'Olympic'
        },
        {
          'catId': '3',
          'catName': 'Half Tri'
        },
        {
          'catId': '4',
          'catName': 'Full Tri'
        },
        {
          'catId': '6',
          'catName': 'Half Marathon'
        },
        {
          'catId': '7',
          'catName': 'Marathon'
        }
      ]

  },
  {
      'racePriority': 'B',
      'raceDistances':
      [
                  {
          'catId': '1',
          'catName': 'Sprint'
        },
        {
          'catId': '2',
          'catName': 'Olympic'
        },
        {
          'catId': '3',
          'catName': 'Half Tri'
        },
        {
          'catId': '6',
          'catName': 'Half Marathon'
        },
        {
          'catId': '7',
          'catName': 'Marathon'
        },
        {
          'catId': '9',
          'catName': '5K'
        },
        {
          'catId': '8',
          'catName': '10K'
        }
      ]

  },
  {
      'racePriority': 'C',
      'raceDistances':
      [
         {
          'catId': '1',
          'catName': 'Sprint'
        },
        {
          'catId': '2',
          'catName': 'Olympic'
        },
        {
          'catId': '3',
          'catName': 'Half Tri'
        },
        {
          'catId': '4',
          'catName': 'Full Tri'
        },
        {
          'catId': '6',
          'catName': 'Half Marathon'
        },
        {
          'catId': '7',
          'catName': 'Marathon'
        }
      ]

  }
];

@Injectable()

export class SeasonSharedDataService {

  constructor() { }

}

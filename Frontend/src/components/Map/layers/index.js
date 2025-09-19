export const clusterLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'equipments',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#3498DB',
        100,
        '#3498DB',
        750,
        '#3498DB'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        12,
        50,
        14,
        100,
        16
      ],
      'circle-stroke-width': 14,
      'circle-stroke-opacity': 0.4,
      'circle-stroke-color': '#7cbdf8'
    }
  };
  
  export const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'equipments',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    }
  };
  
  export const unclusteredPointLayer = {
    id: 'unclustered-point',
    type: 'symbol',
    source: 'equipments',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': 'map-pin',
      'icon-size': 0.28,
      'icon-allow-overlap': true,
      'icon-anchor': 'bottom'
    },
    paint: {
      'icon-color': '#3498DB',
      'icon-halo-color': '#ffffff',
      'icon-halo-width': 2
    }
  };
  
  export const sportIconLayer = {
    id: 'sport-icon',
    type: 'symbol',
    source: 'equipments',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': [
        'match',
        ['get', 'family'],
        'Football', '⚽',
        'Basketball', '🏀',
        'Tennis', '🎾',
        'Swimming', '🏊',
        'Athletics', '🏃',
        '🎯'
      ],
      'text-size': 14,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      'text-anchor': 'top',
      'text-offset': [0, 0.5]
    }
  };
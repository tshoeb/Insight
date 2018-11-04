# Insight: A Kibana Visualization Plugin
The purpose of this plugin is to allow users to establish relationships among their and draw useful **insights** from it. Elasticsearch being a great tool for data queries has made Kibana a key tool for data visualization and analysis. Hence further plugins and visualization are warrated for every increasingly popular Kibana.

## Background
This plugin is developed as part of my master's thesis. I am doing Master's of Science in Cybersecurity from [Hamad Bin Khalifa University](https://hbku.edu.qa/).

This project started based on this paper [Visualization of Actionable Knowledge to Mitigate DRDoS Attacks](https://ieeexplore.ieee.org/abstract/document/7739577/) written by couple of scientists at [Qatar Computing Research Institue](https://www.qcri.org/). In this paper, they showcase an R based visualization tool that they developed to help Internet Service Providers (ISPs) to mitigate DRDOS attacks by creating firewall rules based on the visualized internet traffic data and test it's affect on the traffic within the tool before deploying them.

Insight, on the otherhand, is developed for generic use cases for any and all sorts of data. By being based in Kibana, it allows user to interact with data stored in the most powerful open-source engine Elasticsearch. Insight is fully custom developed plugin and due to use of D3 for visualization it has endless capabilities for further visualization integration and enhancements. Insight, does it's own custom Elasticsearch queries instead of using the default Kibana plugin query capability and yet it is fully integrated with the time picker, query bar, and filter bar. Due to the custom Elasticsearch query capability, Insight can load unlimited amount of attributes from a given index.


## Getting Started

### Prerequisites
Before running you need to do the following steps:
- Run ```npm install```
- Add the following lines to the elasticsearch.yml file
```http.cors.enabled: true```
```http.cors.allow-origin: "*"```
```http.cors.allow-headers: "kbn-version, X-Requested-With, Content-Type, Content-Length, Authorization"```

### Installing
To use the plugin simply clone it into your locally installed Kibana's Plugin folder.

## Authors

Developed by: [Talal Shoeb](https://www.linkedin.com/in/talal-shoeb/)

Supervisor: Dr. Ting Yu
Co. Supervisor: Dr. Yury Zhauniarovich
Visualization Expert: Michael J. Aupetit

## Acknowledgements
Special thanks to:

* My Family
* Fahim Dalvi
* Syed Ali Hashim Moosavi

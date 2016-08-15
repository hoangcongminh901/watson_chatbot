#!/bin/bash

rm -f solr_config.zip 
zip -r solr_config.zip  currency.xml protwords.txt schema.xml solrconfig.xml stopwords.txt synonyms.txt lang/*

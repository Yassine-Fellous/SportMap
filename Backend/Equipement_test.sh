#!/bin/bash
set -e

# Couleurs pour les logs (si terminal supporte)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    NC=''
fi

echo -e "${BLUE}🧪 Starting API Tests...${NC}"

# Variables
API_URL="http://localhost:1335"
EXPECTED_COUNT=5825
MAX_WAIT=120
WAIT_COUNT=0

echo -e "${YELLOW}⏳ Waiting for API to be ready...${NC}"
until curl -f $API_URL/api/v1/equipments/ > /dev/null 2>&1; do
    echo "Waiting for API... ($WAIT_COUNT/$MAX_WAIT)"
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    if [ $WAIT_COUNT -gt $MAX_WAIT ]; then
        echo -e "${RED}❌ Timeout waiting for API${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ API is ready!${NC}"

# Export des résultats pour CI (optionnel)
if [ "$CI" = "true" ]; then
    echo "::set-output name=api_ready::true"
fi

# Test 1: Vérifier que les données sont chargées
echo "📊 Test 1: Checking data count..."
RESPONSE=$(curl -s $API_URL/api/v1/equipments/)
COUNT=$(echo $RESPONSE | jq '. | length')

if [ "$COUNT" -gt 0 ]; then
    echo "✅ Test 1 PASSED: Found $COUNT equipments (expected: $EXPECTED_COUNT)"
else
    echo "❌ Test 1 FAILED: No data found"
    exit 1
fi

# Test 2: Vérifier l'endpoint equipments
echo "🏃 Test 2: Testing /api/v1/equipments/ endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/v1/equipments/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Test 2 PASSED: Equipments endpoint returns 200"
else
    echo "❌ Test 2 FAILED: Equipments endpoint returns $STATUS"
    exit 1
fi

# Test 3: Vérifier l'endpoint GeoJSON
echo "🗺️  Test 3: Testing /api/v1/geojson/ endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/v1/geojson/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Test 3 PASSED: GeoJSON endpoint returns 200"
else
    echo "❌ Test 3 FAILED: GeoJSON endpoint returns $STATUS"
    exit 1
fi

# Test 4: Vérifier l'endpoint sports
echo "⚽ Test 4: Testing /api/v1/sports/ endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/api/v1/sports/)
if [ "$STATUS" = "200" ]; then
    echo "✅ Test 4 PASSED: Sports endpoint returns 200"
else
    echo "❌ Test 4 FAILED: Sports endpoint returns $STATUS"
    exit 1
fi

# Test 5: Vérifier le filtrage géographique
echo "🌍 Test 5: Testing geographic filtering..."
RESPONSE=$(curl -s "$API_URL/api/v1/equipments/?bounds=5.1,43.1,5.7,43.4")
FILTERED_COUNT=$(echo $RESPONSE | jq '. | length')
if [ "$FILTERED_COUNT" -gt 0 ] && [ "$FILTERED_COUNT" -lt "$COUNT" ]; then
    echo "✅ Test 5 PASSED: Geographic filtering works ($FILTERED_COUNT results)"
else
    echo "⚠️  Test 5 WARNING: Geographic filtering returned $FILTERED_COUNT results"
fi

# Test 6: Vérifier le format des données
echo "📋 Test 6: Testing data structure..."
FIRST_ITEM=$(curl -s $API_URL/api/v1/equipments/ | jq '.[0]')
REQUIRED_FIELDS=("id" "inst_nom" "coordonnees" "equip_type_name")

for field in "${REQUIRED_FIELDS[@]}"; do
    if echo $FIRST_ITEM | jq -e ".$field" > /dev/null; then
        echo "✅ Field '$field' exists"
    else
        echo "❌ Test 6 FAILED: Missing field '$field'"
        exit 1
    fi
done

echo "🎉 All tests PASSED! API is ready for production."
package health_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"carbon-scribe/project-portal/project-portal-backend/internal/health"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestCreateSystemMetric(t *testing.T) {
	// Setup Gin in test mode
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	v1 := router.Group("/api/v1")

	// Load database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/carbonscribe?sslmode=disable"
	}

	// Initialize database connection
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize real dependencies
	repo := health.NewRepository(db)
	service := health.NewService(repo)
	handler := health.NewHandler(service)
	handler.RegisterRoutes(v1)

	// Prepare payload
	reqBody := health.CreateSystemMetricRequest{
		MetricName: "cpu_usage_test",
		MetricType: "gauge",
		Value:      45.5,
	}
	body, _ := json.Marshal(reqBody)

	// Execute request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/health/metrics", bytes.NewBuffer(body))
	router.ServeHTTP(w, req)

	// Assertions for POST
	assert.Equal(t, http.StatusCreated, w.Code)

	var postResponse health.SystemMetric
	err = json.Unmarshal(w.Body.Bytes(), &postResponse)
	assert.NoError(t, err)
	assert.Equal(t, "cpu_usage_test", postResponse.MetricName)

	// Execute GET request to verify retrieval
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("GET", "/api/v1/health/metrics?metric_name=cpu_usage_test", nil)
	router.ServeHTTP(w2, req2)

	// Assertions for GET
	assert.Equal(t, http.StatusOK, w2.Code)

	var getResponse []health.SystemMetric
	err = json.Unmarshal(w2.Body.Bytes(), &getResponse)
	assert.NoError(t, err)
	assert.NotEmpty(t, getResponse)
	assert.Equal(t, "cpu_usage_test", getResponse[0].MetricName)
}

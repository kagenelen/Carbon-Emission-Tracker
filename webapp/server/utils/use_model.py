import pandas as pd
import tensorflow as tf
from sklearn.model_selection import LeaveOneOut
import sys
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Disable tensor warning about CPU

# Load and preprocess CSV data
def load_data(file_path):
    # Load the CSV data into a DataFrame
    data = pd.read_csv(file_path)

    # Usage: 1=education, 2=office, 3=retail, 4=hospital, 5=residential
    
    # Extract features and labels
    inputs = data[['usage', 'gfa', 'volume', 'floor']].values
    labels = data['total_waste'].values.reshape(-1, 1)  # Reshape for compatibility
    
    return inputs, labels

# Create the model
def create_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(1, activation=softplus, input_shape=(4,), kernel_initializer='he_normal')
    ])
    
    # Compile the model with mean squared error loss
    model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])
    return model

# Train the model using Leave-One-Out Cross Validation (LOOCV)
def train_model_loo(inputs, labels):
    loo = LeaveOneOut()
    model = create_model()
    
    for entry_train, entry_out in loo.split(inputs):
        input_train, input_test = inputs[entry_train], inputs[entry_out]
        label_train, label_test = labels[entry_train], labels[entry_out]
        
        # Train the model
        model.fit(input_train, label_train, epochs=100, verbose=0)
        
        # Use test data to check the trained model
        loss, mae = model.evaluate(input_test, label_test, verbose=0)
        print(f'Test Loss: {loss}, Test MAE: {mae}')

    return model

# Function to load data and run LOOCV
def train_model():
    # Load training data
    file_path = 'training_data.csv'
    inputs, labels = load_data(file_path)
    
    # Train the model
    trained_model = train_model_loo(inputs, labels)

    # Make a prediction with an example input
    test_input = [[1, 14, 42, 1]]  # Expect 12
    prediction = trained_model.predict(test_input)
    print(f'Prediction for input1 expect 12: {prediction[0][0]}')

    test_input = [[2,9526,33341,5]]  # Expect 191
    prediction = trained_model.predict(test_input)
    print(f'Prediction for input2, expect 191: {prediction[0][0]}')

    # Save model
    trained_model.save('python_model2')

if __name__ == '__main__':
    # train_model()
    
    # File is called from javascript program with: python3 main.py usage GFA volume floor
    test_input = [float(x) for x in sys.argv[2:6]]
    loaded_model = tf.keras.models.load_model('./utils/tensor_model')
    prediction = loaded_model.predict([test_input], verbose=0) # Result was in [[]]
    res = prediction[0][0]
    print(res)
    sys.stdout.flush()

    exit(0)
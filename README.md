# Janhavi_INBT019897_iNeuBytes

## CIFAR-10 Computer Vision, IMDb Sentiment Analysis, and Movie Recommendation

This repository contains the projects completed during the **iNeuBytes AI/ML internship**.

The repository includes:

1. A controlled CNN study for CIFAR-10 image classification.
2. A classical machine learning and deep learning study for IMDb sentiment analysis.
3. A movie recommendation application with separate backend and frontend components.
4. Detailed Jupyter notebooks and a combined project report.

---

## Author

- **Name:** Janhavi
- **Internship ID:** INBT019897
- **Course ID:** AIINB20626
- **Organization:** iNeuBytes

---

## Repository Structure

```text
Janhavi_INBT019897_iNeuBytes/
│
├── Task 1/
│   ├── Task 1 Part A.ipynb
│   ├── Task 1 Part B.ipynb
│   └── Task 1 Part C.ipynb
│
├── Task 2/
│   ├── Task 2 Part A.ipynb
│   ├── Task 2 Part B.ipynb
│   └── Task 2 Part C.ipynb
│
├── movie-recommender/
│   ├── backend/
│   └── frontend/
│
├── .gitignore
├── README.md
└── Report on Task 1 And task 2.docx
```

---

# Project 1: Task 1

## Computer Vision Using CNN Models

Task 1 investigates convolutional neural networks for image classification using the CIFAR-10 dataset.

The task follows a controlled experimental design:

```text
Hypothesis → Method → Training → Evaluation → Analysis → Conclusion
```

All experiments use a fixed train/validation/test split and a fixed training budget to ensure fair comparison.

---

## Task 1 Objectives

The main objectives are:

- Build a traditional CNN baseline.
- Adapt an AlexNet-style architecture for CIFAR-10 images.
- Diagnose overfitting.
- Compare different data augmentation levels.
- Study the effect of increasing model depth.
- Build a final customized CNN using the best-performing technique.
- Compare accuracy, model size, training time, and confusion patterns.

---

## Dataset: CIFAR-10

CIFAR-10 contains:

- 60,000 RGB images.
- Image dimensions: `32 × 32 × 3`.
- 50,000 training images.
- 10,000 test images.
- 10 object classes.

### Classes

```text
Airplane
Automobile
Bird
Cat
Deer
Dog
Frog
Horse
Ship
Truck
```

The original CIFAR-10 Python batch files were loaded and converted into Keras-compatible image arrays.

---

## Reproducibility Settings

The following controls were used throughout Task 1:

- Random seed: `42`
- Training samples: `45,000`
- Validation samples: `5,000`
- Test samples: `10,000`
- Epochs: `10`
- Batch size: `32`
- Optimizer: Adam
- Learning rate: `0.001`
- Loss function: Sparse categorical cross-entropy

The same train/validation/test split was reused throughout the experiments.

---

## Task 1 Part A: Traditional CNN Baseline

The baseline model is an AlexNet-inspired CNN adapted for CIFAR-10's small `32 × 32` images.

### Baseline architecture

```text
Input: 32 × 32 × 3
        ↓
Conv2D: 32 filters, 3 × 3, ReLU
        ↓
MaxPooling2D: 2 × 2
        ↓
Conv2D: 64 filters, 3 × 3, ReLU
        ↓
MaxPooling2D: 2 × 2
        ↓
Conv2D: 128 filters, 3 × 3, ReLU
        ↓
MaxPooling2D: 2 × 2
        ↓
Conv2D: 256 filters, 3 × 3, ReLU
        ↓
MaxPooling2D: 2 × 2
        ↓
Flatten
        ↓
Dense: 256 units, ReLU
        ↓
Dense: 10 units, Softmax
```

The baseline intentionally does not use:

- Data augmentation.
- Dropout.
- Batch normalization.
- L2 regularization.

### Baseline result

| Metric | Result |
|---|---:|
| Training accuracy | 95.65% |
| Validation accuracy | 70.60% |
| Test accuracy | 70.05% |
| Train-validation gap | 25.05 percentage points |
| Trainable parameters | 456,778 |
| Training epochs | 10 |
| Approximate training time | 670 seconds |

The large difference between training and validation accuracy indicates significant overfitting.

---

## Task 1 Part B: Controlled Experiments

Task 1 Part B studies the effects of:

- Light data augmentation.
- Moderate data augmentation.
- Aggressive data augmentation.
- Increased convolutional depth.

### Master experiment table

| Experiment | Configuration | Train accuracy | Validation accuracy | Test accuracy | Train-validation gap | Parameters | Training time |
|---|---|---:|---:|---:|---:|---:|---:|
| A | Baseline CNN | 95.65% | 70.60% | 70.05% | 25.05% | 456,778 | ~670 s |
| B1 | Horizontal flip only | 86.16% | 75.24% | 75.28% | 10.92% | ~456,778 | ~820 s |
| B2 | Flip + rotation + translation | 68.47% | 69.66% | 70.56% | -1.19% | ~456,778 | ~920 s |
| B3 | Flip + strong rotation + shift + zoom + contrast | 55.68% | 59.40% | 60.06% | -3.72% | ~456,778 | ~990 s |
| C1 | Deeper CNN with an additional 512-filter block | 83.21% | 75.50% | 74.87% | 7.71% | 1,702,474 | 2,272 s |

### Main findings

- Horizontal flipping improved generalization and produced the highest test accuracy.
- Moderate augmentation reduced the overfitting gap but caused underfitting.
- Aggressive augmentation significantly reduced performance.
- Increasing depth improved accuracy over the baseline but required substantially more computation.
- Light augmentation was more efficient than increasing depth.

---

## Task 1 Part C: Final Customized CNN

The final model was designed using the best evidence from Part B.

### Selected technique

The final model uses:

- Horizontal flip augmentation.
- The original four-block CNN architecture.
- Adam optimizer with learning rate `0.001`.
- The same 10-epoch training budget.

The deeper model was not selected because it required approximately 3.7 times more trainable parameters and much longer training time while performing slightly worse than the light augmentation model.

### Final result

| Metric | Baseline CNN | Final customized CNN |
|---|---:|---:|
| Training accuracy | 95.65% | 85.17% |
| Validation accuracy | 70.60% | 74.94% |
| Test accuracy | 70.05% | 75.33% |
| Train-validation gap | 25.05% | 10.23% |
| Trainable parameters | 456,778 | Approximately 456,778 |
| Training time | ~670 s | Approximately 720 s |

### Accuracy improvement

```text
75.33% - 70.05% = 5.28 percentage points
```

The final model exceeded the required improvement target of three percentage points.

### Confusion analysis

The baseline model struggled with visually similar animal classes, especially:

- Cat versus Dog.
- Bird versus Deer.
- Cat versus Deer.

The final model improved several difficult classes:

| Class | Baseline recall | Final recall | Change |
|---|---:|---:|---:|
| Cat | 0.45 | 0.52 | +0.07 |
| Bird | 0.56 | 0.68 | +0.12 |
| Deer | 0.69 | 0.72 | +0.03 |
| Dog | 0.60 | 0.56 | -0.04 |

The final model improved the macro F1-score from approximately `0.69` to `0.75`.

---

## Task 1 Notebooks

### `Task 1 Part A.ipynb`

Contains:

- CIFAR-10 dataset loading.
- Pixel normalization.
- Fixed train/validation/test split.
- Traditional CNN construction.
- Baseline training.
- Test evaluation.
- Classification report.
- Confusion matrix.

### `Task 1 Part B.ipynb`

Contains:

- Baseline training and validation curve analysis.
- Light augmentation experiment.
- Moderate augmentation experiment.
- Aggressive augmentation experiment.
- Deeper CNN experiment.
- Master experiment comparison.

### `Task 1 Part C.ipynb`

Contains:

- Final customized CNN.
- Horizontal flip augmentation.
- Final model training.
- Baseline versus final comparison.
- Classification report.
- Confusion matrix.
- Trade-off analysis.

---

# Project 2: Task 2

## Sentiment Analysis Using ML and DL

Task 2 compares classical machine learning and deep learning approaches for binary sentiment classification using IMDb movie reviews.

The task includes:

- Text cleaning.
- TF-IDF feature extraction.
- Logistic Regression.
- Linear SVM.
- Tokenization and padding.
- Embedding layers.
- LSTM models.
- Dropout regularization experiments.
- Final model comparison.

---

## Task 2 Objectives

The main objectives are:

- Build classical sentiment-analysis baselines.
- Compare Logistic Regression and Linear SVM.
- Build an LSTM sentiment classifier.
- Study the effect of dropout.
- Analyze misclassified reviews.
- Compare classical models with deep learning models.
- Select the most suitable model based on accuracy and computational cost.

---

## Dataset: IMDb Movie Reviews

The IMDb dataset contains:

- 50,000 movie reviews.
- 25,000 positive reviews.
- 25,000 negative reviews.

The dataset is balanced.

### Dataset split

| Split | Number of reviews |
|---|---:|
| Training | 40,000 |
| Validation | 5,000 |
| Test | 5,000 |

Each split preserves the balance between positive and negative reviews.

---

## Task 2 Preprocessing

The following preprocessing steps were used:

1. Convert text to lowercase.
2. Remove HTML tags such as `<br />`.
3. Remove punctuation and non-alphabetic characters.
4. Normalize whitespace.
5. Convert labels:
   - Positive → `1`
   - Negative → `0`

### Important note about stopwords

The current implementation does not explicitly remove stopwords.

This was intentional because words such as `not` can be important for sentiment classification:

```text
not good
not interesting
not worth watching
```

Removing stopwords without protecting negation words could reduce performance.

---

## Task 2 Part A: Classical Machine Learning

### TF-IDF settings

```python
TfidfVectorizer(
    max_features=20000,
    ngram_range=(1, 2),
    min_df=5,
    max_df=0.95
)
```

### TF-IDF representation

- Vocabulary size: 20,000.
- N-gram range: unigrams and bigrams.
- Minimum document frequency: 5.
- Maximum document frequency: 0.95.

The resulting feature matrices were:

```text
Training:   (40000, 20000)
Validation: (5000, 20000)
Testing:    (5000, 20000)
```

Bigrams help capture short phrases such as:

```text
not good
very bad
well done
highly recommended
```

### Classical model results

| Model | Validation accuracy | Test accuracy | Precision | Recall | F1-score |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 90.32% | 90.82% | 0.91 | 0.91 | 0.91 |
| Linear SVM | 90.04% | 91.06% | 0.91 | 0.91 | 0.91 |

The Linear SVM was selected as the best classical baseline.

---

## Classical model error analysis

The Linear SVM misclassified:

```text
447 out of 5000 test reviews
```

The main error patterns were:

- Mixed positive and negative sentiment.
- Negation.
- Sarcasm and irony.
- Indirect criticism.
- Plot summaries.
- Sentiment requiring long-range context.

These errors occur because TF-IDF models primarily rely on word and phrase frequencies rather than understanding the full sequence of a review.

---

## Task 2 Part B: Deep Learning and LSTM Experiments

### Tokenization

The cleaned reviews were converted into integer sequences using a Keras tokenizer.

```python
Tokenizer(
    num_words=20000,
    oov_token="<OOV>"
)
```

Words outside the selected vocabulary were replaced with the `<OOV>` token.

### Sequence padding

- Maximum sequence length: 250 tokens.
- Padding: post-padding.
- Truncation: post-truncation.

### LSTM architecture

```text
Input token sequence
        ↓
Embedding layer
Vocabulary: 20,000
Embedding dimension: 128
        ↓
LSTM layer
128 units
        ↓
Dense layer
1 sigmoid output
        ↓
Positive/negative prediction
```

### Training configuration

- Optimizer: Adam.
- Loss: Binary cross-entropy.
- Batch size: 64.
- Epochs: 5.
- Validation set: Same frozen validation set as the classical models.

---

## Dropout regularization study

Three LSTM configurations were compared:

- Dropout `0.0`.
- Dropout `0.3`.
- Dropout `0.5`.

### Results

| Configuration | Train accuracy | Validation accuracy | Test accuracy | F1-score |
|---|---:|---:|---:|---:|
| LSTM dropout 0.0 | 91.12% | 87.40% | 87.14% | 0.8716 |
| LSTM dropout 0.3 | 94.55% | 89.62% | 89.14% | 0.8915 |
| LSTM dropout 0.5 | 61.21% | 77.50% | 77.10% | 0.7622 |

### Findings

- Dropout `0.3` produced the strongest LSTM performance.
- Dropout `0.0` showed a larger generalization gap.
- Dropout `0.5` was too strong and caused underfitting.
- Moderate dropout offered the best balance between learning capacity and regularization.

---

## Task 2 Part C: Final Comparison

### Best models

- Best classical model: Linear SVM.
- Best LSTM model: LSTM with dropout `0.3`.

### Final performance table

| Model | Test accuracy | Precision | Recall | F1-score |
|---|---:|---:|---:|---:|
| Logistic Regression | 90.82% | 0.91 | 0.91 | 0.91 |
| Linear SVM | **91.06%** | **0.91** | **0.91** | **0.91** |
| LSTM dropout 0.0 | 87.14% | 0.87 | 0.87 | 0.87 |
| LSTM dropout 0.3 | 89.14% | 0.89 | 0.89 | 0.89 |
| LSTM dropout 0.5 | 77.10% | 0.77 | 0.77 | 0.77 |

### Final conclusion

The Linear SVM achieved the highest test accuracy at `91.06%`.

The best LSTM reached `89.14%`, which was lower than the SVM. Therefore, the LSTM did not outperform the classical baseline under the current training and preprocessing conditions.

This demonstrates that a simpler model can be the better choice when:

- The dataset is sufficiently large and clean.
- TF-IDF captures strong sentiment features.
- The classical classifier is well configured.
- The deep learning model has a limited training budget.
- Additional neural-network tuning is not justified by the accuracy gain.

---

## Task 2 Notebooks

### `Task 2 Part A.ipynb`

Contains:

- IMDb dataset loading.
- Class distribution analysis.
- Text cleaning.
- Fixed train/validation/test split.
- TF-IDF vectorization.
- Logistic Regression.
- Linear SVM.
- Classification reports.
- Misclassified-review analysis.

### `Task 2 Part B.ipynb`

Contains:

- Tokenization.
- Sequence conversion.
- Padding.
- Embedding layer.
- LSTM architecture.
- Dropout experiments.
- Training and validation curves.
- Test-set evaluation.

### `Task 2 Part C.ipynb`

Contains:

- Best classical model evaluation.
- Best LSTM model evaluation.
- Final comparison table.
- Error analysis.
- Model selection.
- Final evidence-based conclusion.

---

# Project 3: Movie Recommender

The `movie-recommender` directory contains a movie recommendation application with a separate backend and frontend.

```text
movie-recommender/
├── backend/
└── frontend/
```

## Backend

The `backend` directory contains the server-side implementation of the recommendation application.

It is responsible for tasks such as:

- Processing recommendation requests.
- Handling API endpoints.
- Managing recommendation logic.
- Communicating with the frontend.

## Frontend

The `frontend` directory contains the client-side interface of the movie recommender.

It is responsible for:

- Displaying the application interface.
- Accepting user input.
- Sending requests to the backend.
- Displaying recommended movies.

### Running the movie recommender

Open separate terminals for the backend and frontend.

```bash
cd movie-recommender/backend
```

Install the backend dependencies according to the dependency file in the backend directory, then start the backend server.

In another terminal:

```bash
cd movie-recommender/frontend
```

Install the frontend dependencies according to the dependency file in the frontend directory, then start the frontend development server.

The exact commands may depend on the framework and package configuration inside the respective directories.

---

# Installation

## Requirements

Recommended Python version:

```text
Python 3.9 or newer
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Suggested Python packages include:

```text
numpy
pandas
scikit-learn
tensorflow
matplotlib
seaborn
kagglehub
```

The movie recommender may contain separate dependency files for its backend and frontend. Install those dependencies from their respective directories.

---

# Running the Notebooks

1. Clone the repository:

```bash
git clone https://github.com/JMR825/Janhavi_INBT019897_iNeuBytes.git
```

2. Enter the project directory:

```bash
cd Janhavi_INBT019897_iNeuBytes
```

3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Open Jupyter Notebook or JupyterLab:

```bash
jupyter notebook
```

5. Run the notebooks in the following order.

### Task 1

```text
Task 1/Task 1 Part A.ipynb
Task 1/Task 1 Part B.ipynb
Task 1/Task 1 Part C.ipynb
```

### Task 2

```text
Task 2/Task 2 Part A.ipynb
Task 2/Task 2 Part B.ipynb
Task 2/Task 2 Part C.ipynb
```

Run each notebook from top to bottom to ensure that variables, preprocessing objects, models, and evaluation data are initialized correctly.

---

# Reproducibility

The experiments use a fixed seed of `42`.

A complete reproducible implementation should include:

```python
import os
import random
import numpy as np
import tensorflow as tf

SEED = 42

os.environ["PYTHONHASHSEED"] = str(SEED)
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)
```

For scikit-learn models, use:

```python
random_state=42
```

The following controls were kept constant when comparing experiments:

- Random seed.
- Dataset split.
- Preprocessing pipeline.
- Evaluation metrics.
- Training budget.
- Test set.

---

# Evaluation Metrics

The following metrics were used:

- Accuracy.
- Precision.
- Recall.
- F1-score.
- Training-validation gap.
- Confusion matrix.
- Training time.
- Parameter count where applicable.

The training-validation gap was calculated as:

```text
Training-validation gap =
Training accuracy - Validation accuracy
```

A large positive gap indicates overfitting.

A small or negative gap can indicate underfitting or strong regularization.

---

# Overall Results

| Project | Best model | Result |
|---|---|---:|
| CIFAR-10 baseline | Traditional CNN | 70.05% test accuracy |
| CIFAR-10 final model | CNN + horizontal flip | 75.33% test accuracy |
| IMDb classical baseline | Linear SVM + TF-IDF | 91.06% test accuracy |
| IMDb deep learning model | LSTM + dropout 0.3 | 89.14% test accuracy |

---

# Limitations

## Task 1

- Batch normalization, dropout, and L2 regularization were not included in the reported experiments.
- A complete optimizer and learning-rate comparison was not performed.
- The deeper model used horizontal flipping in addition to the extra convolutional block, so the architecture comparison should be interpreted with this experimental detail in mind.
- The training budget was limited to 10 epochs.
- Only one primary random seed was used.

## Task 2

- Stopwords were not explicitly removed in the current preprocessing code.
- Pretrained GloVe or Word2Vec embeddings were not included.
- Additional TF-IDF configurations were not fully evaluated.
- LSTM models were trained for five epochs.
- Longer training and additional hyperparameter tuning may improve LSTM performance.
- Transformer-based models were outside the scope of this project.

---

# Future Work

## Computer vision

- Add Batch Normalization.
- Evaluate Dropout and L2 regularization separately.
- Compare Adam, SGD with momentum, and RMSprop.
- Test multiple learning rates.
- Explore ResNet-style architectures.
- Investigate MixUp, Cutout, and CutMix.
- Use transfer learning with suitable pretrained models.
- Train deeper models for a longer budget.

## Sentiment analysis

- Compare unigram-only and unigram-plus-bigram TF-IDF representations.
- Test different vocabulary sizes and document-frequency thresholds.
- Add controlled stopword-removal experiments.
- Use pretrained GloVe or Word2Vec embeddings.
- Try Bidirectional LSTM and GRU models.
- Add attention mechanisms.
- Train LSTM models for more epochs.
- Compare the results with transformer-based models such as DistilBERT.

## Movie recommender

- Add user-specific recommendations.
- Improve recommendation ranking.
- Add movie similarity search.
- Add filters for genre, year, rating, and language.
- Deploy the frontend and backend as a complete web application.
- Add authentication and user profiles.

---

# Report

The complete written report for the CNN and sentiment-analysis tasks is available in:

```text
Report on Task 1 And task 2.docx
```

The report includes:

- Methodology.
- Preprocessing details.
- Model architectures.
- Experimental protocol.
- Performance tables.
- Confusion-matrix analysis.
- Error analysis.
- Trade-off analysis.
- Conclusions and future work.

---

# Acknowledgements

This project was completed as part of the **iNeuBytes AI/ML internship**.

Technologies and libraries used include:

- Python.
- NumPy.
- Pandas.
- Scikit-learn.
- TensorFlow.
- Keras.
- Matplotlib.
- Seaborn.
- Jupyter Notebook.
- Kaggle datasets.

---

# License

This repository is intended for educational and internship purposes.

You may add an open-source license such as the MIT License if the project is intended for public reuse.

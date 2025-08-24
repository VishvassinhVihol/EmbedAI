from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import PyPDFLoader
import json

def Pdf(file, user_query, api_key, qdrant_url, qdrant_api_key=None):
    print('📄 PDF file path:', file)

    # Load and split PDF
    loader = PyPDFLoader(file)
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    splitted_docs = splitter.split_documents(docs)

    # Embedding
    embedder = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=api_key
    )

    # Save vectors to Qdrant
    QdrantVectorStore.from_documents(
        documents=splitted_docs,
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    # Retriever
    retriever = QdrantVectorStore.from_existing_collection(
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    # OpenAI LLM client
    client = ChatOpenAI(
        model="gpt-4o",
        temperature=0,
        api_key=api_key
    )

    # Step 1: Hypothetical answer
    system_prompt = """
        You are an expert agent.
        Your task is to generate a helpful answer based on the user's query.

        Instructions:
        - Focus on clarity and correctness.
        - Assume the user is a beginner unless stated otherwise.
        - Avoid jargon where possible.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]

    response = client.chat.completions.create(messages=messages)
    hypothetical_answer = response.choices[0].message.content.strip()

    # Step 2: Retrieve relevant chunks
    related_docs = retriever.similarity_search(query=hypothetical_answer)

    if not related_docs:
        return "There is no context available to answer this query."

    relevant_docs_text = "\n\n".join([doc.page_content for doc in related_docs])

    # Step 3: Final prompt
    final_prompt = f"""
        You are an expert in Retrieval-Augmented Generation (RAG) and LLM-based systems.
        Your job is to answer the user query using only the relevant documents provided.

        Rules:
        - Be professional and concise.
        - Do NOT guess. If no answer is found in the documents, say: "There is no context available to answer this query."
        
        User Query: {user_query}

        Relevant Documents:
        {relevant_docs_text}
    """

    final_response = client.chat.completions.create(
        messages=[{"role": "system", "content": final_prompt}]
    )

    final_answer = final_response.choices[0].message.content.strip()
    return final_answer

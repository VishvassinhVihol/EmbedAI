from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders import WebBaseLoader
import json

def website(website_url, user_query, api_key, qdrant_url, qdrant_api_key=None):
    # Load and split website content
    loader = WebBaseLoader(website_url)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.split_documents(docs)

    # Embeddings
    embedder = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=api_key
    )

    # Store in Qdrant
    QdrantVectorStore.from_documents(
        documents=docs,
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    # Setup retriever
    retriever = QdrantVectorStore.from_existing_collection(
        url=qdrant_url,
        api_key=qdrant_api_key,
        collection_name="my_docs",
        embedding=embedder
    )

    # Initialize OpenAI Chat client
    client = ChatOpenAI(
        model="gpt-4o",
        temperature=0,
        api_key=api_key
    )

    # Step 1: Hypothetical answer for better retrieval
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

    # Step 2: Search for relevant documents
    related_docs = retriever.similarity_search(query=hypothetical_answer)

    if not related_docs:
        return "There is no context available to answer this query."

    relevant_docs_text = "\n\n".join([doc.page_content for doc in related_docs])

    # Step 3: Final prompt using retrieved docs
    final_prompt = f"""
        You are an expert in Retrieval-Augmented Generation (RAG) and LLM-based systems.
        You generate a final answer based on the user query and relevant documents.
        
        Instructions:
        - Only answer from the relevant documents provided.
        - If no relevant information is present, respond with: "There is no context available to answer this query."
        - Keep the answer professional and direct. No extra commentary.

        User Query: {user_query}

        Relevant Documents:
        {relevant_docs_text}
    """

    final_response = client.chat.completions.create(
        messages=[{"role": "system", "content": final_prompt}]
    )

    final_answer = final_response.choices[0].message.content.strip()
    return final_answer
